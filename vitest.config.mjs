import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    exclude: ['tools/**', 'node_modules/**', 'tap-snapshots/**', 'dist'],
    coverage: {
      enabled: true,
      exclude: ['tools/**', 'node_modules/**', 'tap-snapshots/**', 'dist'],
    },
  },
});
