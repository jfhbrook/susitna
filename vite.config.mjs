import process from 'node:process';

import swc from 'unplugin-swc';
import consts from 'rollup-plugin-consts';
import jscc from 'rollup-plugin-jscc';
import { minify } from 'rollup-plugin-esbuild-minify';
import { defineConfig } from 'vite';
import vitePkg from 'vite/package.json' with { type: 'json' };
import swcPkg from '@swc/core/package.json' with { type: 'json' };

import pkg from './package.json';

import {
  config,
  swcConfig,
  testConfig,
  parseBoolEnv,
} from '@jfhbrook/grabthar';

const MATBAS_BUILD =
  process.env.MATBAS_BUILD === 'release' ? 'release' : 'debug';
const MATBAS_VERSION = pkg.version;

const debugConfig = {
  _MATBAS_BUILD: MATBAS_BUILD,
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
    consts({
      matbas: {
        build: MATBAS_BUILD,
        version: MATBAS_VERSION,
      },
      versions: {
        matbas: MATBAS_VERSION,
        vite: vitePkg.version,
        swc: swcPkg.version,
      },
    }),
    jscc({
      values: debugConfig,
    }),
    swc.vite(swcConfig),
    config.build.minify && minify(),
  ],
});
