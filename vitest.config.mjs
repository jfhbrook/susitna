import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

import { viteTestConfig, swcTestConfig } from './build/test.mjs';

export default defineConfig({
  test: viteTestConfig,
  plugins: [swc.vite(swcTestConfig)],
});
