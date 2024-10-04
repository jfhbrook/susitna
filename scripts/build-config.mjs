#!/usr/bin/env node

import { writeFileSync } from 'node:fs';

const exclude = ['node_modules', 'bin', 'tools', 'dist'];
const tscExclude = ['*.njk.ts'];
const swcExclude = ['.njk.ts'];
const testExclude = ['test'];
const baseUrl = './';
const outDir = './dist';
const target = 'es2022';
const enableDecorators = true;
const moduleType = 'commonjs';

const tscConfig = {
  exclude: exclude.concat(tscExclude),
  compilerOptions: {
    module: moduleType,
    declaration: true,
    baseUrl,
    outDir,
    target: target,
    lib: [target],
    sourceMap: true,
    removeComments: true,
    emitDecoratorMetadata: enableDecorators,
    experimentalDecorators: enableDecorators,
    allowSyntheticDefaultImports: true,
    incremental: true,
    skipLibCheck: true,
    strictNullChecks: true,
    noImplicitAny: false,
    strictBindCallApply: false,
    forceConsistentCasingInFileNames: true,
    noFallthroughCasesInSwitch: false,
    esModuleInterop: true,
  },
};

const swcConfig = {
  $schema: 'https://swc.rs/schema.json',
  exclude: exclude.concat(swcExclude),
  jsc: {
    baseUrl,
    parser: {
      syntax: 'typescript',
      jsx: false,
      dynamicImport: true,
      privateMethod: true,
      functionBind: true,
      exportDefaultFrom: false,
      exportNamespaceFrom: false,
      decorators: enableDecorators,
      decoratorsBeforeExport: enableDecorators,
      topLevelAwait: false,
      importMeta: false,
    },
    transform: {
      legacyDecorator: false,
      decoratorMetadata: enableDecorators,
    },
    target: target,
    loose: false,
    externalHelpers: false,
    keepClassNames: true,
  },
  module: {
    type: moduleType,
  },
  minify: false,
};

function writeConfig(filename, config) {
  writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
}

writeConfig('tsconfig.json', tscConfig);
writeConfig('tsconfig.build.json', {
  extends: "./tsconfig.json",
  exclude: exclude.concat(testExclude)
});
writeConfig('./.swcrc', swcConfig);
writeConfig('./.swcrc.build', {...swcConfig, exclude: exclude.concat(testExclude) });
