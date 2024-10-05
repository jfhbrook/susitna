#!/usr/bin/env node

import { writeFileSync } from 'node:fs';

import { tscConfig } from '../build.mjs';

function writeConfig(filename, config) {
  writeFileSync(filename, JSON.stringify(config, null, 2), 'utf8');
}

writeConfig('tsconfig.json', tscConfig);
