#!/usr/bin/env node

import { writeJSONConfig } from '../build/io.mjs';
import { tscConfig } from '../build/check.mjs';

writeJSONConfig('tsconfig.json', tscConfig);
