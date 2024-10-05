#!/usr/bin/env node

import { writeJSONConfig, writeIgnoreFile } from '../build/io.mjs';
import { tscConfig } from '../build/check.mjs';
import { prettierIgnore, prettierRc } from '../build/format.mjs';

writeJSONConfig('tsconfig.json', tscConfig);
writeJSONConfig('.prettierrc', prettierRc);
writeIgnoreFile('.prettierignore', prettierIgnore);
