import { join, relative, resolve } from 'path';
import { readFileSync, readdirSync } from 'fs';

type FullPath = string;
type Contents = string;

export const EXAMPLES: Record<FullPath, Contents> = Object.fromEntries(
  readdirSync(join(__dirname, '../../examples'))
    .filter((entry) => entry.endsWith('.bas'))
    .map((entry) => [
      relative(
        resolve(join(__dirname, '../..')),
        resolve(join(__dirname, '../../examples', entry)),
      ),
      readFileSync(join(__dirname, '../../examples', entry), 'utf8'),
    ]),
);
