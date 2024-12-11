import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

import minimist from 'minimist';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version: VERSION } = require('../package.json');

const USAGE = `Usage: entrypoint [OPTIONS] [OUTPUT]

Write the Matanuska entry point to OUTPUT.

Options:
  -h, --help               print entrypoint command line options
  -v, --version            print entrypoint version

Environment:
  MATBAS_BUILD             the build type - either 'debug' or 'release'
`;

export interface Args {
  outputPath: string;
}

function help() {
  console.log(USAGE);
  process.exit(0);
}

function version() {
  console.log(`v${VERSION}`);
  process.exit(0);
}

function usage(message: string) {
  console.error(message + '\n');
  console.error(USAGE);
  process.exit(70);
}

function error(err: any, code: number = 1): never {
  console.error(err);
  process.exit(code);
}

export function parseArgs(argv: typeof process.argv): Args {
  const args = minimist(argv, {
    alias: {
      h: 'help',
      v: 'version',
    },
    boolean: ['help', 'version'],
    unknown(opt: string): boolean {
      if (opt.startsWith('-')) {
        usage(`Unknown option: ${opt}`);
        return false;
      }
      return true;
    },
  });

  if (args.help) {
    help();
  }

  if (args.version) {
    version();
  }

  if (args._.length < 1) {
    help();
  }

  if (args._.length > 1) {
    usage(`Unexpected argument: ${args._[1]}`);
  }

  const outputPath: string = args._[0];

  return { outputPath };
}

function run(vars: typeof process.env): void {
  const env: typeof process.env = Object.assign({}, process.env);
  for (const [name, value] of Object.entries(vars)) {
    env[`TF_VAR_${name}`] = value;
  }
  const { status } = spawnSync(
    'terraform',
    [
      `-chdir=${path.join(__dirname, '..', 'modules', 'entrypoint')}`,
      'apply',
      '-auto-approve',
    ],
    { env, stdio: 'inherit' },
  );
  if (status) {
    error('', status);
  }
}

export default async function main(
  argv: typeof process.argv = process.argv.slice(2),
): Promise<void> {
  const { outputPath } = parseArgs(argv);

  run({
    matbas_build: process.env.MATBAS_BUILD || 'debug',
    path: path.join(process.cwd(), outputPath),
  });
}
