import { DECORATORS } from './constants.mjs';
import { exclude } from './util.mjs';

import config from './config.json' with { type: "json" };

export const tscConfig = {
  exclude: exclude(config.exclude, config.check.exclude),
  compilerOptions: {
    outDir: config.outDir,
    module: config.moduleType,
    moduleResolution: config.moduleType,
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
