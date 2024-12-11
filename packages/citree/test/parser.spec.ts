import { expectEOF, expectSingleResult } from 'typescript-parsec';
import { expect, test } from 'vitest';

import { scanner } from '../src/scanner';
import { parser } from '../src/parser';

const EXAMPLE = `// example

import { Token } from './token'

type Expr in "./expr" {
  import * from "./value"

  Assign   => name: Token, value: Expr | null
  Call     => args: Expr[]
}`;

const EXPECT = {
  imports: [
    {
      type: 'import',
      statement: 'import { Token } from "./token";',
      path: './token',
    },
  ],
  types: [
    {
      type: 'type',
      name: 'Expr',
      path: './expr',
      imports: [
        {
          type: 'import',
          statement: 'import * from "./value";',
          path: './value',
        },
      ],
      nodes: [
        {
          type: 'node',
          name: 'Assign',
          fields: [
            { name: 'name', type: 'Token', default: null },
            { name: 'value', type: 'Expr | null', default: null },
          ],
        },
        {
          type: 'node',
          name: 'Call',
          fields: [{ name: 'args', type: 'Expr[]', default: null }],
        },
      ],
    },
  ],
};

test('it parses a simple example', async () => {
  const result = expectSingleResult(
    expectEOF(parser.parse(scanner.parse(EXAMPLE))),
  );
  expect(result).toEqual(EXPECT);
});
