import { spawnSync } from 'node:child_process';

export function runTest() {
  spawnSync('vitest', ['--run'], { stdio: 'inherit' });
}

export function runSnap() {
  spawnSync('vitest', ['--run', '--update'], { stdio: 'inherit' });
}
