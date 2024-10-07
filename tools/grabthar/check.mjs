import { merge } from './util.mjs';

import config from './config.mjs';

export const checkExclude = merge(config.exclude, config.check.exclude);
