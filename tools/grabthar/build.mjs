import { DECORATORS } from './constants.mjs';

import config from './config.json';

export const swcConfig = {
  jsc: {
    parser: {
      syntax: 'typescript',
      jsx: false,
      decorators: DECORATORS,
      decoratorsBeforeExport: DECORATORS,
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
      decoratorMetadata: DECORATORS,
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
