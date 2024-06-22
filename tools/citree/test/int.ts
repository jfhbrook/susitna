import { join, resolve } from 'path';
import { readFileSync } from 'fs';

import t from 'tap';

import main from '../src/index';

t.test('integration', async (t) => {
  await main([resolve(join(__dirname, '../example/ast.citree'))]);

  for (let f of ['cmd.ts', 'expr.ts', 'index.ts']) {
    const out = readFileSync(
      resolve(join(__dirname, '../example', f)),
      'utf8',
    );
    t.matchSnapshot(out);
  }
});
