import config from './config.mjs';
export { tscConfig } from './check.mjs';
export { swcConfig } from './build.mjs';
export { testConfig } from './test.mjs';
export * as lint from './lint.mjs';
export * as format from './format.mjs';
export { writeJSONConfig, writeIgnoreFile } from './io.mjs';
export { merge } from './util.mjs';
export { config };
