import { writeTscConfig } from './tsc.mjs';
import { run } from './io.mjs';

export function runCheck() {
  writeTscConfig();
  run('tsc', ['--noEmit']);
}
