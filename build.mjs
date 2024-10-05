import config from './build.json';

export { config };

// Necessary for NestJS to work
const decorators = true;

export const tscConfig = {
  exclude: config.exclude.concat(config.check.exclude),
  compilerOptions: {
    outDir: config.check.outDir,
    module: config.moduleType,
    moduleResolution: config.moduleType,
    target: config.target,
    lib: [config.target],
    esModuleInterop: true,
    incremental: true,
    sourceMap: config.sourceMaps,
    emitDecoratorMetadata: decorators,
    experimentalDecorators: decorators,
    allowSyntheticDefaultImports: true,
    skipLibCheck: true,
    ...config.check.compilerOptions,
  },
};

export const tscBuildConfig = {
  extends: './tsconfig.json',
  exclude: tscConfig.exclude.concat(['test']),
};

export const swcBuildConfig = {
  exclude: config.exclude.concat(config.build.exclude),
  jsc: {
    parser: {
      syntax: 'typescript',
      jsx: false,
      decorators: decorators,
      decoratorsBeforeExport: decorators,
      dynamicImport: true,
      privateMethod: true,
      functionBind: true,
      exportDefaultFrom: true,
      exportNamespaceFrom: true,
      topLevelAwait: false,
      importMeta: false,
    },
    transform: {
      legacyDecorator: false,
      decoratorMetadata: decorators,
    },
    target: config.target,
    loose: false,
    externalHelpers: false,
    keepClassNames: true,
  },
  module: {
    type: config.moduleType,
  },
  sourceMaps: config.sourceMaps,
  inlineSourcesContent: config.sourceMaps,
  minify: config.build.minify,
};

export const swcTestConfig = {
  ...swcBuildConfig,
  exclude: config.exclude.concat(config.test.exclude),
  minify: false,
};
