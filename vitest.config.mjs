import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    exclude: ['tools/**', 'node_modules/**', 'tap-snapshots/**', 'dist'],
    coverage: {
      // Coverage isn't useful yet, since most tests are still being run
      // with tap
      enabled: false,
      exclude: ['tools/**', 'node_modules/**', 'tap-snapshots/**', 'dist'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
