import swc from 'unplugin-swc';
import { minify } from 'rollup-plugin-esbuild-minify';
import { defineConfig } from 'vite';

import { config, swcConfig, testConfig } from '@jfhbrook/grabthar';

export default defineConfig({
  build: {
    ssr: config.entrypoint,
    outDir: config.outDir,
  },
  ssr: {},
  test: testConfig,
  plugins: [swc.vite(swcConfig), minify()],
});
