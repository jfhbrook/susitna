import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    exclude: ['tools/**', 'node_modules/**', 'scripts/**', 'dist'],
    coverage: {
      enabled: true,
      exclude: ['tools/**', 'node_modules/**', 'scripts/**', 'dist', 'test'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
