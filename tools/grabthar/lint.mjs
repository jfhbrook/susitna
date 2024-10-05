import { merge } from './util.mjs';

import config from './config.mjs';

export const ignoresConfig = {
  ignores: merge(config.exclude, config.lint.exclude),
};
export const rulesConfig = { rules: config.lint.rules };
