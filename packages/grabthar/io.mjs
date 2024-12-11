import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import process from 'node:process';

import quote from 'shell-quote/quote.js';

import { logger } from './log.mjs';

export function writeFile(filename, contents) {
  logger.info(`- generating ${filename}...`);
  writeFileSync(filename, contents, 'utf8');
}

export function writeJSONConfig(filename, config) {
  logger.info(`- generating ${filename}`);
  writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
}

export function writeIgnoreFile(filename, ignores) {
  logger.info(`- generating ${filename}...`);
  writeFileSync(filename, ignores.join('\n'), 'utf8');
}

export function packageLoader(url) {
  const require = createRequire(url);
  return (pkg) => {
    const path = pkg === '.' ? './package.json' : join(pkg, 'package.json');
    return JSON.parse(readFileSync(require.resolve(path)));
  };
}

export function run(bin, argv, options = {}) {
  let { exitOnError } = options;
  if (typeof exitOnError === 'undefined') {
    exitOnError = true;
  }
  const path = process.env.PATH.split(':');
  path.concat(join(process.cwd(), 'node_modules', '.bin'));

  logger.info(`> ${quote([bin].concat(argv))}`);

  const proc = spawnSync(bin, argv, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: path.join(':'),
    },
  });

  if (exitOnError && proc.status) {
    process.exit(proc.status);
  }
}
