import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import config from './build/config.json';
import { swcConfig } from './build/build.mjs';
import { testConfig } from './build/test.mjs';

export default defineConfig({
  build: {
    ssr: config.entrypoint,
    outDir: config.outDir,
  },
  ssr: {},
  test: testConfig,
  plugins: [swc.vite(swcConfig)],
});
