import t from 'tap';
import { Test } from 'tap';

import { ParseWarning } from '../exceptions';
import { formatter } from '../format';
import {
  Group,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from '../ast/expr';
import { Cmd, Print, Expression } from '../ast/cmd';
import { CommandGroup, Line, Input, Program } from '../ast';
import { parseInput, parseProgram } from '../parser';
import { FILENAME } from './helpers/traceback';

const EXPRESSIONS: Array<[string, Cmd]> = [
  // NOTE: '1' parses as a line number.
  ['0xff', new Expression(new IntLiteral(255))],
  ['0o755', new Expression(new IntLiteral(493))],
  ['0b01', new Expression(new IntLiteral(1))],
  ['123.456', new Expression(new RealLiteral(123.456))],
  ['true', new Expression(new BoolLiteral(true))],
  ['false', new Expression(new BoolLiteral(false))],
  ['nil', new Expression(new NilLiteral())],
  ['"hello world"', new Expression(new StringLiteral('hello world'))],
  ["'hello world'", new Expression(new StringLiteral('hello world'))],
  ['"\\"time machine\\""', new Expression(new StringLiteral('"time machine"'))],
  ["'don\\'t'", new Expression(new StringLiteral("don't"))],
  ['(1)', new Expression(new Group(new IntLiteral(1)))],
];

for (const [source, cmd] of EXPRESSIONS) {
  t.test(`non-numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(result[0], new Input([new CommandGroup([cmd])]));
  });

  t.test(`numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    t.same(result[0], new Input([new Line(100, [cmd])]));
  });
}

t.test('non-numbered invalid string escape', async (t: Test) => {
  const result = parseInput("'\\q'");

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([new CommandGroup([new Expression(new StringLiteral('\\q'))])]),
  );
  t.matchSnapshot(formatter.format(warning));
});

t.test('numbered invalid string escape', async (t: Test) => {
  const result = parseInput("100 '\\q'");

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([new Line(100, [new Expression(new StringLiteral('\\q'))])]),
  );
  t.matchSnapshot(formatter.format(warning));
});

t.test('non-numbered print command', async (t: Test) => {
  const result = parseInput('print "hello world"');

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([
      new CommandGroup([new Print(new StringLiteral('hello world'))]),
    ]),
  );
});

t.test('numbered print command', async (t: Test) => {
  const result = parseInput('100 print "hello world"');

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([new Line(100, [new Print(new StringLiteral('hello world'))])]),
  );
});

t.test('non-numbered print command without arguments', async (t: Test) => {
  t.plan(2);
  t.throws(() => {
    try {
      parseInput('print');
    } catch (err) {
      t.matchSnapshot(formatter.format(err));
      throw err;
    }
  });
});

t.test('numbered print command without arguments', async (t: Test) => {
  t.plan(2);
  t.throws(() => {
    try {
      parseInput('100 print');
    } catch (err) {
      t.matchSnapshot(formatter.format(err));
      throw err;
    }
  });
});

t.test('empty input', async (t: Test) => {
  const result = parseInput('');

  t.equal(result[1], null);

  t.same(result[0], new Input([]));
});

t.test('empty line', async (t: Test) => {
  const result = parseInput('100');

  t.equal(result[1], null);

  t.same(result[0], new Input([new Line(100, [])]));
});

t.test('multiple inputs', async (t: Test) => {
  const result = parseInput(
    '100 print "hello world"\n"foo"\n200 print "goodbye"',
  );

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([
      new Line(100, [new Print(new StringLiteral('hello world'))]),
      new CommandGroup([new Expression(new StringLiteral('foo'))]),
      new Line(200, [new Print(new StringLiteral('goodbye'))]),
    ]),
  );
});

t.test('simple program', async (t: Test) => {
  const result = parseProgram(
    '100 print "hello world"\n200 print "goodbye"',
    FILENAME,
  );

  t.equal(result[1], null);

  t.same(
    result[0],
    new Program([
      new Line(100, [new Print(new StringLiteral('hello world'))]),
      new Line(200, [new Print(new StringLiteral('goodbye'))]),
    ]),
  );
});

t.test('out of order program', async (t: Test) => {
  const result = parseProgram(
    '200 print "hello world"\n100 print "goodbye"',
    FILENAME,
  );

  t.equal(result[1], null);

  t.same(
    result[0],
    new Program([
      new Line(100, [new Print(new StringLiteral('goodbye'))]),
      new Line(200, [new Print(new StringLiteral('hello world'))]),
    ]),
  );
});

t.test('program with non-numbered input', async (t: Test) => {
  t.plan(2);
  t.throws(() => {
    try {
      parseProgram(
        '100 print "hello world"\n"foo"\n200 print "goodbye"',
        FILENAME,
      );
    } catch (err) {
      t.matchSnapshot(formatter.format(err));
      throw err;
    }
  });
});

// Need to support unary minus
t.todo('program with a negative line number', async (t: Test) => {
  t.plan(2);
  t.throws(() => {
    try {
      parseProgram(
        '100 print "hello world"\n-100 "foo"\n200 print "goodbye"',
        FILENAME,
      );
    } catch (err) {
      t.matchSnapshot(formatter.format(err));
      throw err;
    }
  });
});

// TODO: tests with illegal tokens (what is an illegal token?)
// TODO: a test involving both errors and warnings
