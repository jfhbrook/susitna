import { execSync } from 'node:child_process';

import { writeTscConfig } from './tsc.mjs';

export function runCheck() {
  writeTscConfig();
  execSync('tsc --noEmit');
}
