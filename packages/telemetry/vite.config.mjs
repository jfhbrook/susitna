import process from 'node:process';

import consts from 'rollup-plugin-consts';
import jscc from 'rollup-plugin-jscc';

import { defineConfig } from '@jfhbrook/grabthar/vite';

const MATBAS_BUILD =
  process.env.MATBAS_BUILD === 'release' ? 'release' : 'debug';
const MATBAS_VERSION = process.env.MATBAS_VERSION || '1.0.0';

export default defineConfig({
  plugins: [
    consts({
      matbas: {
        build: MATBAS_BUILD,
        version: MATBAS_VERSION,
      },
    }),
    jscc({
      values: {
        _MATBAS_BUILD: MATBAS_BUILD,
      },
    }),
  ],
});
