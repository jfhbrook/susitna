#!/usr/bin/env node

import process from 'node:process';

import minimist from 'minimist';

import { runCheck } from './check.mjs';
import { runTest, runSnap } from './test.mjs';
import { writeJSONConfig, writeIgnoreFile } from './io.mjs';
import { tscConfig } from './tsc.mjs';
import { prettierIgnore, prettierRc } from './format.mjs';

const HELP = `USAGE: grabthar COMMAND

COMMANDS:
  config  Generate prettier and tsc configuration
`;

function main() {
  console.log('"By Grabthar\'s hammer, what a savings!"');
  const argv = minimist(process.argv.slice(2), {
    alias: { h: 'help' },
    boolean: ['help'],
  });

  if (!argv._.length) {
    console.log(HELP);
    process.exit(1);
  }

  if (argv.help) {
    console.log(HELP);
    process.exit(0);
  }

  switch (argv._[0]) {
    case 'config':
      writeJSONConfig('tsconfig.json', tscConfig);
      writeJSONConfig('.prettierrc', prettierRc);
      writeIgnoreFile('.prettierignore', prettierIgnore);
      break;
    case 'check':
      runCheck();
      break;
    case 'test':
      runTest();
      break;
    case 'snap':
      runSnap();
      break;
    default:
      console.log(`Unknown command: ${argv._[0]}`);
      break;
  }
}

main();
