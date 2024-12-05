import { join, resolve } from 'path';
import { readFileSync } from 'fs';

import { expect, test } from 'vitest';

import main from '../src/index';

test('integration', async () => {
  await main([resolve(join(__dirname, '../example/ast.citree'))]);

  for (let f of ['instr.ts', 'expr.ts', 'index.ts']) {
    const out = readFileSync(resolve(join(__dirname, '../example', f)), 'utf8');
    expect(out).toMatchSnapshot();
  }
});
