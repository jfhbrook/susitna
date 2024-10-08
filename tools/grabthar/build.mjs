import { run } from './io.mjs';
import { writeTscBuildConfig } from './tsc.mjs';

export function runBuild() {
  run('vite', ['build']);
}

export function runTscBuild() {
  writeTscBuildConfig();
  run('tsc', []);
}
