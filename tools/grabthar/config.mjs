import { readFileSync } from 'node:fs';
import yaml from 'yaml';

let contents = '{}';

try {
  contents = readFileSync('./grabthar.yml', 'utf8')
} catch (_err) {
  try {
    contents = readFileSync('./grabthar.yaml', 'utf8')
  } catch (_err) {}
}

const data = yaml.parse(contents);
const checkData = data.check || {};
const buildData = data.build || {};
const testData = data.test || {};
const coverageData = data.coverage || {};
const formatData = data.format || {};
const lintData = data.lint || {};

export default {
  ...data,
  outDir: data.outDir || 'dist',
  exlude: data.exclude || [],
  target: data.target || 'es2022',
  moduleType: data.moduleType || 'nodenext',
  sourceMaps: typeof data.sourceMaps === 'undefined' ? true : data.sourceMaps,
  check: {
    exclude: checkData.exclude || [],
    compilerOptions: checkData.compilerOptions || {},
  },
  build: {
    minify: typeof buildData.minify === 'undefined' ? true : buildData.minify
  },
  test: {
    exclude: testData.exclude || []
  },
  coverage: {
    enabled: typeof coverageData.enabled === 'undefined' ? true : buildData.enabled,
    exclude: coverageData.exclude || [],
  },
  format: {
    ...formatData,
    exclude: formatData.exclude || [],
  },
  lint: {
    exclude: lintData.exclude || [],
    rules: lintData.rules || {},
  }
}
