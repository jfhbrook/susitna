import { merge } from './util.mjs';

import config from './config.json';
import { swcBuildConfig } from './build.mjs';

const testExclude = merge(
  config.exclude,
  config.build.exclude,
  config.test.exclude,
);

export const viteTestConfig = {
  exclude: testExclude,
  coverage: {
    ...config.coverage,
    exclude: merge(testExclude, config.coverage.exclude),
  },
};

export const swcTestConfig = {
  ...swcBuildConfig,
  exclude: testExclude,
  minify: false,
};
