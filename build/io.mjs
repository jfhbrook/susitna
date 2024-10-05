import { writeFileSync } from 'node:fs';

export function writeJSONConfig(filename, config) {
  writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
}

export function writeIgnoreFile(filename, ignores) {
  writeFileSync(filename, ignores.join('\n'), 'utf8');
}
