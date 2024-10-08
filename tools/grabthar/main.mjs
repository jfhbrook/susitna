#!/usr/bin/env node

import process from 'node:process';

import minimist from 'minimist';

import { runCheck } from './check.mjs';
import { runFormat } from './format.mjs';
import { runBuild, runTscBuild } from './build.mjs';
import { runTest, runSnap } from './test.mjs';
import { runLint } from './lint.mjs';

const HELP = `USAGE: grabthar COMMAND

COMMANDS:
  check      Run type checks with tsc
  format     Format source with prettier
  build      Build with vite
  build:tsc  Build with tsc
  test       Test with vitest
  snap       Update vitest snapshots
  lint       Lint with prettier and eslint
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
    case 'check':
      runCheck();
      break;
    case 'format':
      runFormat();
      break;
    case 'build':
      runBuild();
      break;
    case 'build:tsc':
      runTscBuild();
      break;
    case 'test':
      runTest();
      break;
    case 'snap':
      runSnap();
      break;
    case 'lint':
      runLint();
      break;
    default:
      console.log(`Unknown command: ${argv._[0]}`);
      break;
  }
}

main();
