import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import { config, swcBuildConfig } from './build.mjs';

export default defineConfig({
  build: {
    ssr: config.entrypoint,
    outDir: config.build.outDir,
  },
  ssr: {},
  plugins: [swc.vite(swcBuildConfig)],
});
