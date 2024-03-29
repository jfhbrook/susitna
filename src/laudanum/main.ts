import { writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import minimist from 'minimist';
import { globSync } from 'glob';

const argv = minimist(process.argv.slice(2));

const configPath: string = argv.p || './laudanum.json';

const config = require(configPath);

let files = argv._;

if (!argv._.length) {
  files = config.include.reduce((files, pattern) => {
    if (!pattern.endsWith('.l')) {
      pattern = [`${pattern}.js.l`, `${pattern}.ts.l`];
    }
    return files.concat(
      globSync(pattern, config.exclude ? { ignore: config.exclude } : {}),
    );
  }, []);
}

let definitions = config.definitions || {};

if (argv.D) {
  for (let def of typeof argv.D === 'string' ? [argv.D] : argv.D) {
    const [key, value] = def.split('=');
    definitions[key] = value || true;
  }
}

let cppArgv = config.preprocessorArguments || [];

for (let [key, value] of Object.entries(definitions)) {
  cppArgv.push(`-D${key}${value === true ? '' : `=${value}`}`);
}

for (let input of files) {
  const output = input.replace(/\.l$/, '');
  let { stdout: script } = spawnSync('cpp', cppArgv.concat(input), {
    encoding: 'utf8',
  });
  script = script
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n');
  writeFileSync(output, script);
}
