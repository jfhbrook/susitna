import { defineConfig as defineViteConfig } from 'vite';

import swc from 'unplugin-swc';
import { minify } from 'rollup-plugin-esbuild-minify';

import config from './config.mjs';
import { swcConfig } from './swc.mjs';
import { testExclude } from './test.mjs';
import { merge } from './util.mjs';

export const testConfig = {
  exclude: testExclude,
  coverage: {
    ...config.coverage,
    exclude: merge(testExclude, config.coverage.exclude),
  },
};

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
