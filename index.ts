import * as dotenv from 'dotenv';

import { MATBAS_BUILD } from './constants';

if (MATBAS_BUILD === 'debug') {
  dotenv.config();
}

import { getTracer } from './debug';

import { container } from './container';
import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';

const tracer = getTracer('main');

function parseArgs(argv: Argv, env: Env): Config {
  return Config.load(argv, env);
}

async function run(config: Config, host: Host): Promise<void> {
  await tracer.span('main', async () => {
    const { translator } = container(config, host);

    if (config.script) {
      await translator.script(config.script);
    } else {
      await translator.repl();
    }
  });
}

export const main = cli({ parseArgs, run });
