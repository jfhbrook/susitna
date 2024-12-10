import { DECORATORS } from './constants.mjs';
import { writeJSONConfig } from './io.mjs';

import config from './config.mjs';

export const tscConfig = {
  exclude: config.check.exclude,
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
  exclude: config.build.exclude,
  compilerOptions: {
    ...tscConfig.compilerOptions,
    moduleResolution: 'nodenext',
  },
};

export function writeTscConfig() {
  writeJSONConfig('tsconfig.json', tscConfig);
}

export function writeTscBuildConfig() {
  writeJSONConfig('tsconfig.build.json', tscBuildConfig);
}
