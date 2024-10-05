import { DECORATORS } from './constants.mjs';
import { merge } from './util.mjs';

import config from './config.mjs';

export const tscConfig = {
  exclude: merge(config.exclude, config.check.exclude),
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
