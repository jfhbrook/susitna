import { merge } from './util.mjs';

import config from './config.mjs';

export const testExclude = merge(config.exclude, config.test.exclude);
