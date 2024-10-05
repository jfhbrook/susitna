import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import { config, swcTestConfig } from './build.mjs';

export default defineConfig({
  test: {
    exclude: config.exclude.concat(config.test.exclude),
    coverage: config.coverage,
  },
  plugins: [swc.vite(swcTestConfig)],
});
