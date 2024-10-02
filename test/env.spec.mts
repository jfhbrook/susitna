import { describe, expect, test } from 'vitest';

import { parseBoolEnv } from '../env.mjs';

const ENV_FALSE: Array<string | undefined> = [
  undefined,
  '',
  '   ',
  '0',
  '  0  ',
  'false',
  'FALSE',
  '  fAlSe  ',
];

const ENV_TRUE: Array<string | undefined> = [
  '1',
  '100',
  '  1  ',
  'true',
  'TRUE',
  '  tRuE  ',
  'anything',
];

describe('parseBoolEnv', () => {
  for (const value of ENV_FALSE) {
    test(`the string \`${value}\` parses to \`false\``, () => {
      expect(parseBoolEnv(value)).toBe(false);
    });
  }

  for (const value of ENV_TRUE) {
    test(`the string \`${value}\` parses to \`true\``, () => {
      expect(parseBoolEnv(value)).toBe(true);
    });
  }
});
