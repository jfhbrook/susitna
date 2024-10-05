import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import config from '@jfhbrook/grabthar/config.mjs';
import { swcConfig } from '@jfhbrook/grabthar/build.mjs';
import { testConfig } from '@jfhbrook/grabthar/test.mjs';

export default defineConfig({
  build: {
    ssr: config.entrypoint,
    outDir: config.outDir,
  },
  ssr: {},
  test: testConfig,
  plugins: [swc.vite(swcConfig)],
});
