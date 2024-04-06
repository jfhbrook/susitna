import t from 'tap';
import { Test } from 'tap';

import { parseBoolEnv } from '../env';

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

t.test('parseBoolEnv', async (t: Test) => {
  for (const value of ENV_FALSE) {
    t.test(`the string \`${value}\` parses to \`false\``, async (t: Test) => {
      t.equal(parseBoolEnv(value), false);
    });
  }

  for (const value of ENV_TRUE) {
    t.test(`the string \`${value}\` parses to \`true\``, async (t: Test) => {
      t.equal(parseBoolEnv(value), true);
    });
  }
});
