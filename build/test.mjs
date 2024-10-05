import { merge } from './util.mjs';

import config from './config.json';

const testExclude = merge(config.exclude, config.test.exclude);

export const testConfig = {
  exclude: testExclude,
  coverage: {
    ...config.coverage,
    exclude: merge(testExclude, config.coverage.exclude),
  },
};
