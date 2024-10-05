import { writeFileSync } from 'node:fs';

export function writeJSONConfig(filename, config) {
  writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
}
