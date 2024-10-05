import process from 'node:process';

import swc from 'unplugin-swc';
import jscc from 'rollup-plugin-jscc';
import { minify } from 'rollup-plugin-esbuild-minify';
import { defineConfig } from 'vite';

import {
  config,
  swcConfig,
  testConfig,
  parseBoolEnv,
} from '@jfhbrook/grabthar';

const debugConfig = {
  _MATBAS_BUILD: process.env.MATBAS_BUILD || 'debug',
  _DEBUG_TRACE: parseBoolEnv(process.env.DEBUG_TRACE),
  _DEBUG_SHOW_TREE: parseBoolEnv(process.env.DEBUG_SHOW_TREE),
  _DEBUG_TRACE_COMPILER: parseBoolEnv(process.env.DEBUG_TRACE_COMPILER),
  _DEBUG_SHOW_CHUNK: parseBoolEnv(process.env.DEBUG_SHOW_CHUNK),
  _DEBUG_TRACE_RUNTIME: parseBoolEnv(process.env.DEBUG_TRACE_RUNTIME),
  _DEBUG_TRACE_GC: parseBoolEnv(process.env.DEBUG_TRACE_GC),
};

export default defineConfig({
  build: {
    ssr: config.entrypoint,
    outDir: config.outDir,
  },
  ssr: {},
  test: testConfig,
  plugins: [
    jscc({
      values: debugConfig,
    }),
    swc.vite(swcConfig),
  ].concat(config.build.minify ? [minify()] : []),
});
