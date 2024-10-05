import config from './build.json';

function exclude(...excludes) {
  return excludes.reduce((acc, exc) => acc.concat(exc), []).sort();
}

export { config };

// Necessary for NestJS to work
const decorators = true;

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
    emitDecoratorMetadata: decorators,
    experimentalDecorators: decorators,
    allowSyntheticDefaultImports: true,
    skipLibCheck: true,
    ...config.check.compilerOptions,
  },
};

export const swcBuildConfig = {
  exclude: exclude(config.exclude, config.build.exclude),
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

const testExclude = exclude(
  config.exclude,
  config.build.exclude,
  config.test.exclude,
);

export const viteTestConfig = {
  exclude: testExclude,
  coverage: {
    ...config.coverage,
    exclude: exclude(testExclude, config.coverage.exclude),
  },
};

export const swcTestConfig = {
  ...swcBuildConfig,
  exclude: testExclude,
  minify: false,
};
