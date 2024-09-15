// This test is automatically generated by @matanuska/test-generator.
// See ./tools/test-generator/README.md for more details.

import t from 'tap';
import { Test } from 'tap';

import { FILENAME } from './helpers/files';
import { parseProgram } from './helpers/parser';

t.test('operator precedence', async (t: Test) => {
  t.test('9 + 8 * -7 > 6 / 5 and 4 == 3 or 2 - 1', async (t: Test) => {
    const [ast, warning] = parseProgram(
      `10 9 + 8 * -7 > 6 / 5 and 4 == 3 or 2 - 1`,
      FILENAME,
    );

    t.matchSnapshot((ast.lines[0].instructions[0] as any).expression);
    t.matchSnapshot(warning);
  });
});
