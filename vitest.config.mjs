import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

export default defineConfig({
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
        'vitest.config.mjs',
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
