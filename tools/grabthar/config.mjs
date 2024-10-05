import { readFileSync } from 'node:fs';
import yaml from 'yaml';

export default yaml.parse(readFileSync('./grabthar.yaml', 'utf8'));
