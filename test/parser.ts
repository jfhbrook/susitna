import t from 'tap';
import { Test } from 'tap';

import { formatter } from '../format';
import {
  Expr,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
} from '../ast/expr';
import { Cmd, Print, Expression } from '../ast/cmd';
import { TokenKind } from '../tokens';
import { parseInput, parseProgram } from '../parser';
import { Result, Ok, Err, Warn } from '../result';

const LITERALS: Array<[string, Cmd]> = [
  // NOTE: '1' parses as a line number.
  ['0xff', new Expression(new IntLiteral(255))],
  ['0o755', new Expression(new IntLiteral(493))],
  ['0b01', new Expression(new IntLiteral(1))],
  ['123.456', new Expression(new RealLiteral(123.456))],
  ['true', new Expression(new BoolLiteral(true))],
  ['false', new Expression(new BoolLiteral(false))],
  ['"hello world"', new Expression(new StringLiteral('hello world'))],
];

for (let [source, cmd] of LITERALS) {
  t.test(`non-numbered literal expression ${source}`, async (t: Test) => {
    const result = parseInput(source);

    t.type(result, Ok);

    t.same(result.result, [[cmd]]);
  });
}

t.test('invalid string escape', async (t: Test) => {
  const result = parseInput("'\\q'");

  t.type(result, Warn);

  const warning = (result as any).warning;

  t.same(result.result, [[new Expression(new StringLiteral('\\q'))]]);
  t.matchSnapshot(formatter.format(warning));
});

// TODO: bare print statement
// TODO: numbered literal expressions
// TODO: numbered string with invalid escape sequences
// TODO: numbered print statement
// TODO: bare malformed print statement
// TODO: numbered malformed print statement
// TODO: multi-line numbered inputs
// TODO: multi-line mixed inputs
// TODO: multi-line numbered inputs with parseProgram
// TODO: multi-line mixed inputs with parseProgram
// TODO: multi-line input with a negative valued line
// TODO: illegal tokens scattered in random places in various statements
// TODO: a test involving both errors and warnings
