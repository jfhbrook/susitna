import { defineConfig as defineViteConfig } from 'vite';

import swc from 'unplugin-swc';
import { minify } from 'rollup-plugin-esbuild-minify';

import config from './config.mjs';
import { swcConfig } from './swc.mjs';
import { testConfig } from './test.mjs';

export function defineConfig(cfg) {
  return defineViteConfig(
    Object.assign({}, cfg, {
      build: {
        ...(config.build || {}),
        ssr: config.entrypoint,
        outDir: config.outDir,
      },
      ssr: { ...(cfg.ssr || {}) },
      test: {
        ...(cfg.test || {}),
        ...testConfig,
      },
      plugins: [
        ...(cfg.plugins || []),
        swc.vite(swcConfig),
        config.build.minify && minify(),
      ],
    }),
  );
}
