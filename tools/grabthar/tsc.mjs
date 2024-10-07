import { DECORATORS } from './constants.mjs';
import { merge } from './util.mjs';

import config from './config.mjs';
import { checkExclude } from './check.mjs';

const testDir = 'test';

export const tscConfig = {
  exclude: checkExclude,
  compilerOptions: {
    outDir: config.outDir,
    module: config.target,
    moduleResolution: 'bundler',
    target: config.target,
    lib: [config.target],
    esModuleInterop: true,
    incremental: true,
    sourceMap: config.sourceMaps,
    emitDecoratorMetadata: DECORATORS,
    experimentalDecorators: DECORATORS,
    allowSyntheticDefaultImports: true,
    skipLibCheck: true,
    ...config.check.compilerOptions,
  },
};

export const tscBuildConfig = {
  ...tscConfig,
  exclude: merge(checkExclude, [testDir]),
};
