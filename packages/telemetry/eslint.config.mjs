import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

import { lint } from '@jfhbrook/grabthar';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  lint.ignoresConfig,
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  lint.rulesConfig,
];
