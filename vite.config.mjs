import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import config from './build/config.json';
import { swcBuildConfig } from './build/build.mjs';

export default defineConfig({
  build: {
    ssr: config.entrypoint,
    outDir: config.outDir,
  },
  ssr: {},
  plugins: [swc.vite(swcBuildConfig)],
});
