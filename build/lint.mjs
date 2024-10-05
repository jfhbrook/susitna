import { merge } from './util.mjs';

import config from './config.json' with { type: 'json' };

export const ignoresConfig = { ignores: merge(config.lint.exclude) };
export const rulesConfig = { rules: config.lint.rules };
