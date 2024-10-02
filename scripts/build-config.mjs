#!/usr/bin/env node

import { writeFileSync } from 'node:fs';

const exclude = ['node_modules', 'bin', 'tools', 'dist'];
const tscExclude = ['*.njk.ts'];
const swcExclude = ['.njk.ts'];
const testExclude = ['test'];

const baseUrl = './';
const outDir = './dist';
const target = 'es2022';
const moduleType = 'nodenext';

const sourceMaps = true;
// Necessary for NestJS to work
const decorators = true;

// Type checks - note, only tsc does type checking
const strictNullChecks = true;
const noImplicitAny = false;
const strictBindCallApply = false;
const forceConsistentCasingInFileNames = true;
const noFallthroughCasesInSwitch = false;

const minify = false; // swc only
const declaration = true; // tsc only
const removeComments = true; // tsc only

const tscConfig = {
  exclude: exclude.concat(tscExclude),
  compilerOptions: {
    module: moduleType,
    baseUrl,
    outDir,
    target: target,
    lib: [target],
    esModuleInterop: true,
    incremental: true,
    sourceMap: sourceMaps,
    emitDecoratorMetadata: decorators,
    experimentalDecorators: decorators,
    declaration,
    removeComments,
    allowSyntheticDefaultImports: true,
    skipLibCheck: true,
    strictNullChecks,
    noImplicitAny,
    strictBindCallApply,
    forceConsistentCasingInFileNames,
    noFallthroughCasesInSwitch,
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
    target: target,
    loose: false,
    externalHelpers: false,
    keepClassNames: true,
  },
  module: {
    type: moduleType,
  },
  sourceMaps,
  inlineSourcesContent: sourceMaps,
  minify,
};

function writeConfig(filename, config) {
  writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
}

writeConfig('tsconfig.json', tscConfig);
writeConfig('tsconfig.build.json', {
  extends: './tsconfig.json',
  exclude: exclude.concat(testExclude),
});
writeConfig('./.swcrc', swcConfig);
writeConfig('./.swcrc.build', {
  ...swcConfig,
  exclude: exclude.concat(testExclude),
});
