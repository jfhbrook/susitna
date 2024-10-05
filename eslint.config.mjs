import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

import { ignoresConfig, rulesConfig } from '@jfhbrook/grabthar/lint.mjs';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  ignoresConfig,
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  rulesConfig,
];
