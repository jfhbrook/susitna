import config from './config.mjs';
import { writePrettierConfig } from './format.mjs';
import { run } from './io.mjs';
import { merge } from './util.mjs';

export const lintExclude = merge(config.exclude, config.lint.exclude);

export const ignoresConfig = {
  ignores: lintExclude,
};

export const rulesConfig = { rules: config.lint.rules };

export function runLint() {
  writePrettierConfig();
  run('prettier', ['--list-different', '.']);
  run('eslint', ['--fix', '**.ts', '**.mjs']);
}
