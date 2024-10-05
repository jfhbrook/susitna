import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import pkg from './package.json';

const dependencies = Object.keys({
  ...pkg.dependencies,
  ...pkg.devDependencies,
});

export default defineConfig({
  build: {
    // exclude: ['tools/**', 'scripts/**', 'dist'],
    ssr: './main.ts',
    outDir: './build',
  },
  ssr: {
    noExternal: dependencies,
  },
  test: {
    exclude: ['tools/**', 'node_modules/**', 'scripts/**', 'dist'],
    coverage: {
      enabled: true,
      exclude: [
        'tools/**',
        'node_modules/**',
        'scripts/**',
        '**.njk.ts',
        '.eslintrc.js',
        'vite.config.mjs',
        'dist',
        'test',
        'index.ts',
        'main.ts',
      ],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
