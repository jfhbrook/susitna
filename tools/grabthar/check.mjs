import { spawnSync } from 'node:child_process';

import { writeTscConfig } from './tsc.mjs';

export function runCheck() {
  writeTscConfig();
  spawnSync('tsc', ['--noEmit'], { stdio: 'inherit' });
}
