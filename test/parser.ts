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
import { Line } from '../ast/line';
import { Program } from '../ast/program';
import { parseInput, parseProgram } from '../parser';
import { Ok, Err, Warn } from '../result';
import { FILENAME } from './helpers/traceback';

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

  t.test(`numbered literal expression ${source}`, async (t: Test) => {
    const result = parseInput(`100 ${source}`);

    t.type(result, Ok);

    t.same(result.result, [new Line(100, [cmd])]);
  });
}

t.test('non-numbered invalid string escape', async (t: Test) => {
  const result = parseInput("'\\q'");

  t.type(result, Warn);

  const warning = (result as any).warning;

  t.same(result.result, [[new Expression(new StringLiteral('\\q'))]]);
  t.matchSnapshot(formatter.format(warning));
});

t.test('numbered invalid string escape', async (t: Test) => {
  const result = parseInput("100 '\\q'");

  t.type(result, Warn);

  const warning = (result as any).warning;

  t.same(result.result, [
    new Line(100, [new Expression(new StringLiteral('\\q'))]),
  ]);
  t.matchSnapshot(formatter.format(warning));
});

t.test('non-numbered print command', async (t: Test) => {
  const result = parseInput('print "hello world"');

  t.type(result, Ok);

  t.same(result.result, [[new Print(new StringLiteral('hello world'))]]);
});

t.test('numbered print command', async (t: Test) => {
  const result = parseInput('100 print "hello world"');

  t.type(result, Ok);

  t.same(result.result, [
    new Line(100, [new Print(new StringLiteral('hello world'))]),
  ]);
});

t.test('non-numbered print command without arguments', async (t: Test) => {
  const result = parseInput('print');

  t.type(result, Err);

  const error = (result as any).error;

  t.same(result.result, []);
  t.matchSnapshot(formatter.format(error));
});

t.test('numbered print command without arguments', async (t: Test) => {
  const result = parseInput('100 print');

  t.type(result, Err);

  const error = (result as any).error;

  t.same(result.result, []);
  t.matchSnapshot(formatter.format(error));
});

t.test('multiple inputs', async (t: Test) => {
  const result = parseInput(
    '100 print "hello world"\n"foo"\n200 print "goodbye"',
  );

  t.type(result, Ok);

  t.same(result.result, [
    new Line(100, [new Print(new StringLiteral('hello world'))]),
    [new Expression(new StringLiteral('foo'))],
    new Line(200, [new Print(new StringLiteral('goodbye'))]),
  ]);
});

t.test('simple program', async (t: Test) => {
  const result = parseProgram(
    '100 print "hello world"\n200 print "goodbye"',
    FILENAME,
  );

  t.type(result, Ok);

  t.same(
    result.result,
    new Program([
      new Line(100, [new Print(new StringLiteral('hello world'))]),
      new Line(200, [new Print(new StringLiteral('goodbye'))]),
    ]),
  );
});

t.test('program with non-numbered input', async (t: Test) => {
  const result = parseProgram(
    '100 print "hello world"\n"foo"\n200 print "goodbye"',
    FILENAME,
  );

  t.type(result, Err);

  const error = (result as any).error;

  t.same(
    result.result,
    new Program([
      new Line(100, [new Print(new StringLiteral('hello world'))]),
      new Line(200, [new Print(new StringLiteral('goodbye'))]),
    ]),
  );
  t.matchSnapshot(formatter.format(error));
});

// Need to support unary minus
t.skip('program with a negative line number', async (t: Test) => {
  const result = parseProgram(
    '100 print "hello world"\n-100 "foo"\n200 print "goodbye"',
    FILENAME,
  );

  t.type(result, Err);

  const error = (result as any).error;

  t.same(
    result.result,
    new Program([
      new Line(100, [new Print(new StringLiteral('hello world'))]),
      new Line(200, [new Print(new StringLiteral('goodbye'))]),
    ]),
  );
  t.matchSnapshot(formatter.format(error));
});

// TODO: tests with illegal tokens (what is an illegal token?)
// TODO: a test involving both errors and warnings
