import { describe, expect, test } from 'vitest';

import { parseBoolEnv } from '../util';

const ENV_FALSE = [
  undefined,
  '',
  '   ',
  '0',
  '  0  ',
  'false',
  'FALSE',
  '  fAlSe  ',
];

const ENV_TRUE = ['1', '100', '  1  ', 'true', 'TRUE', '  tRuE  ', 'anything'];

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
