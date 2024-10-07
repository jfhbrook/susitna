import { readFileSync } from 'node:fs';
import yaml from 'yaml';

import { merge } from './util.mjs';

let contents = '{}';

try {
  contents = readFileSync('./grabthar.yml', 'utf8');
} catch (_err) {
  try {
    contents = readFileSync('./grabthar.yaml', 'utf8');
  } catch (_err) {
    console.log('No configuration found.');
  }
}

const data = yaml.parse(contents);
const checkData = data.check || {};
const buildData = data.build || {};
const testData = data.test || {};
const coverageData = data.coverage || {};
const formatData = data.format || {};
const lintData = data.lint || {};

const outDir = data.outDir || 'dist';
const testDir = data.testDir || 'test';

export default {
  ...data,
  outDir: outDir,
  exlude: merge(data.exclude || [], [outDir]),
  target: data.target || 'es2022',
  moduleType: data.moduleType || 'nodenext',
  sourceMaps: typeof data.sourceMaps === 'undefined' ? true : data.sourceMaps,
  check: {
    exclude: merge(checkData.exclude || [], [outDir, 'node_modules']),
    compilerOptions: checkData.compilerOptions || {},
  },
  build: {
    minify: typeof buildData.minify === 'undefined' ? true : buildData.minify,
  },
  test: {
    exclude: testData.exclude || ['node_modules'],
  },
  coverage: {
    enabled:
      typeof coverageData.enabled === 'undefined' ? true : buildData.enabled,
    exclude: merge(coverageData.exclude || [], [
      outDir,
      testDir,
      '*.config.*',
      'node_modules',
    ]),
  },
  format: {
    ...formatData,
    exclude: merge(formatData.exclude || [], [
      'test/__snapshots__',
      '.prettierrc',
      'tsconfig*.json',
    ]),
  },
  lint: {
    exclude: merge(lintData.exclude || [], [outDir]),
    rules: lintData.rules || {},
  },
};
