import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import quote from 'shell-quote/quote.js';

import { logger } from './log.mjs';

export function writeJSONConfig(filename, config) {
  logger.info(`- generating ${filename}`);
  writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
}

export function writeIgnoreFile(filename, ignores) {
  logger.info(`- generating ${filename}...`);
  writeFileSync(filename, ignores.join('\n'), 'utf8');
}

export function run(bin, argv) {
  const path = process.env.PATH.split(':');
  path.concat(join(process.cwd(), 'node_modules', '.bin'));

  logger.info(`> ${quote([bin].concat(argv))}`);

  spawnSync(bin, argv, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: path.join(':'),
    },
  });
}
