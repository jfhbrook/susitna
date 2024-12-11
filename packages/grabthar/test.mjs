import { run } from './io.mjs';

export function runTest() {
  run('vitest', ['--run']);
}

export function runSnap() {
  run('vitest', ['--run', '--update']);
}
