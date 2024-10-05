import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import { viteTestConfig, swcTestConfig } from './build.mjs';

export default defineConfig({
  test: viteTestConfig,
  plugins: [swc.vite(swcTestConfig)],
});
