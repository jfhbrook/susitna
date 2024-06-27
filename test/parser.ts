import t from 'tap';
import { Test } from 'tap';

import { ParseWarning } from '../exceptions';
import { formatter } from '../format';
import {
  Binary,
  Group,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from '../ast/expr';
import { Cmd, Print, Exit, Expression, Rem } from '../ast/cmd';
import { CommandGroup, Line, Input, Program } from '../ast';
import { parseInput, parseProgram } from '../parser';
import { TokenKind } from '../tokens';
import { FILENAME } from './helpers/traceback';

const EXPRESSIONS: Array<[string, Cmd]> = [
  // NOTE: '1' parses as a line number.
  ['0xff', new Expression(new IntLiteral(255), 0, 4)],
  ['0o755', new Expression(new IntLiteral(493), 0, 5)],
  ['0b01', new Expression(new IntLiteral(1), 0, 4)],
  ['123.456', new Expression(new RealLiteral(123.456), 0, 7)],
  ['true', new Expression(new BoolLiteral(true), 0, 4)],
  ['false', new Expression(new BoolLiteral(false), 0, 5)],
  ['nil', new Expression(new NilLiteral(), 0, 3)],
  ['"hello world"', new Expression(new StringLiteral('hello world'), 0, 13)],
  ["'hello world'", new Expression(new StringLiteral('hello world'), 0, 13)],
  [
    '"\\"time machine\\""',
    new Expression(new StringLiteral('"time machine"'), 0, 18),
  ],
  ["'don\\'t'", new Expression(new StringLiteral("don't"), 0, 8)],
  ['(1)', new Expression(new Group(new IntLiteral(1)), 0, 3)],
  [
    '(1 == 1)',
    new Expression(
      new Group(
        new Binary(new IntLiteral(1), TokenKind.EqEq, new IntLiteral(1)),
      ),
      0,
      8,
    ),
  ],
  [
    '(1 <> 1)',
    new Expression(
      new Group(new Binary(new IntLiteral(1), TokenKind.Ne, new IntLiteral(1))),
      0,
      8,
    ),
  ],
];

const WARNED_EXPRESSIONS: Array<[string, Cmd]> = [
  [
    '(1 = 1)',
    new Expression(
      new Group(
        new Binary(new IntLiteral(1), TokenKind.EqEq, new IntLiteral(1)),
      ),
      0,
      7,
    ),
  ],
  [
    '(1 != 1)',
    new Expression(
      new Group(new Binary(new IntLiteral(1), TokenKind.Ne, new IntLiteral(1))),
      0,
      8,
    ),
  ],
];

for (const [source, cmd] of EXPRESSIONS) {
  t.test(`non-numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(result[0], new Input([new CommandGroup(1, source, [cmd])]));
  });

  t.test(`numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    cmd.offsetStart += 4;
    cmd.offsetEnd += 4;

    t.same(result[0], new Input([new Line(100, 1, `100 ${source}`, [cmd])]));

    cmd.offsetStart -= 4;
    cmd.offsetEnd -= 4;
  });
}

for (const [source, cmd] of WARNED_EXPRESSIONS) {
  t.test(`non-numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(source);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    t.same(result[0], new Input([new CommandGroup(1, source, [cmd])]));
  });

  t.test(`numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(`100 ${source}`);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    cmd.offsetStart += 4;
    cmd.offsetEnd += 4;

    t.same(result[0], new Input([new Line(100, 1, `100 ${source}`, [cmd])]));

    cmd.offsetStart -= 4;
    cmd.offsetEnd -= 4;
  });
}

t.test('non-numbered invalid string escape', async (t: Test) => {
  const source = "'\\q'";
  const result = parseInput(source);

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([
      new CommandGroup(1, source, [
        new Expression(new StringLiteral('\\q'), 0, 4),
      ]),
    ]),
  );
  t.matchSnapshot(formatter.format(warning));
});

t.test('numbered invalid string escape', async (t: Test) => {
  const source = "100 '\\q'";
  const result = parseInput(source);

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([
      new Line(100, 1, source, [
        new Expression(new StringLiteral('\\q'), 4, 8),
      ]),
    ]),
  );
  t.matchSnapshot(formatter.format(warning));
});

t.test('print command', async (t: Test) => {
  await t.test('non-numbered', async (t: Test) => {
    const source = 'print "hello world"';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new CommandGroup(1, source, [
          new Print(new StringLiteral('hello world'), 0, 19),
        ]),
      ]),
    );
  });

  await t.test('numbered', async (t: Test) => {
    const source = '100 print "hello world"';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, source, [
          new Print(new StringLiteral('hello world'), 4, 23),
        ]),
      ]),
    );
  });

  await t.test('non-numbered, without arguments', async (t: Test) => {
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

  await t.test('numbered, without arguments', async (t: Test) => {
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
});

t.test('exit command', async (t: Test) => {
  await t.test('non-numbered', async (t: Test) => {
    const source = 'exit 0';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new CommandGroup(1, source, [new Exit(new IntLiteral(0), 0, 6)]),
      ]),
    );
  });

  await t.test('numbered', async (t: Test) => {
    const source = '100 exit 0';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, source, [new Exit(new IntLiteral(0), 4, 10)]),
      ]),
    );
  });

  await t.test('non-numbered, without arguments', async (t: Test) => {
    const source = 'exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new CommandGroup(1, source, [new Exit(null, 0, 4)])]),
    );
  });

  await t.test('numbered, without arguments', async (t: Test) => {
    const source = '100 exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Line(100, 1, source, [new Exit(null, 4, 8)])]),
    );
  });
});

t.test('remarks', async (t: Test) => {
  await t.test('bare remark', async (t: Test) => {
    const source = 'rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new CommandGroup(1, source, [new Rem('this is a comment', 0, 21)]),
      ]),
    );
  });

  await t.test('bare, empty remark', async (t: Test) => {
    const source = 'rem';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new CommandGroup(1, source, [new Rem('', 0, 3)])]),
    );
  });

  await t.test('bare semicolong', async (t: Test) => {
    const source = ';';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new CommandGroup(1, source, [new Rem('', 0, 1)])]),
    );
  });

  await t.test('remark following a command', async (t: Test) => {
    const source = 'print 1 rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new CommandGroup(1, source, [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 8, 29),
        ]),
      ]),
    );
  });

  await t.test('remark as a second command', async (t: Test) => {
    const source = 'print 1 : rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new CommandGroup(1, source, [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 10, 31),
        ]),
      ]),
    );
  });
});

t.test('empty input', async (t: Test) => {
  const result = parseInput('');

  t.equal(result[1], null);

  t.same(result[0], new Input([]));
});

t.test('empty line', async (t: Test) => {
  const source = '100';
  const result = parseInput(source);

  t.equal(result[1], null);

  t.same(result[0], new Input([new Line(100, 1, source, [])]));
});

t.test('multiple inputs', async (t: Test) => {
  const source = ['100 print "hello world"', '"foo"', '200 print "goodbye"'];
  const result = parseInput(source.join('\n'));

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([
      new Line(100, 1, source[0], [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new CommandGroup(2, source[1], [
        new Expression(new StringLiteral('foo'), 0, 5),
      ]),
      new Line(200, 3, source[2], [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
    ]),
  );
});

// TODO: This error just says "unexpected token". If we can detect when a
// failed expression is immediately following a line number, we should be able
// to show a better error. The trace is basically:
//
// - successfully parse line number
// - attempt to parse commands
// - parse the *first* command
// - fall through to an expression statement
// - fail to parse a valid expression statement
//
// We would need to track that we just parsed a line number (isLine), that
// we're parsing the very first command, and that we're parsing an expression
// statement. That's a boatload of state, but I think it's doable.
t.test('bare expression starting with an integer', async (t: Test) => {
  t.plan(2);
  t.throws(() => {
    try {
      parseInput('1 + 1');
    } catch (err) {
      t.matchSnapshot(formatter.format(err));
      throw err;
    }
  });
});

t.test('simple program', async (t: Test) => {
  const source = ['100 print "hello world"', '200 print "goodbye"'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);

  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 1, source[0], [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new Line(200, 2, source[1], [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
    ]),
  );
});

t.test('out of order program', async (t: Test) => {
  const source = ['200 print "hello world"', '100 print "goodbye"'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.matchSnapshot(formatter.format(result[1]));

  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 2, source[1], [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
      new Line(200, 1, source[0], [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
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

t.test('program with a negative line number', async (t: Test) => {
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

t.test('accidentally an entire semicolon', async (t: Test) => {
  t.plan(2);
  t.throws(() => {
    try {
      parseInput('print 1 + 1;');
    } catch (err) {
      try {
        t.matchSnapshot(formatter.format(err));
      } catch (e) {
        console.log(e);
      }
      throw err;
    }
  });
});
