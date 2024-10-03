import t from 'tap';
import { Test } from 'tap';

import { ParseWarning } from '../exceptions.mjs';
import { formatter } from '../format.mjs';
import { Token, TokenKind } from '../tokens.mjs';

import { Source } from '../ast/source.js';
import {
  Binary,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from '../ast/expr.js';
import {
  Instr,
  Print,
  Exit,
  Expression,
  Rem,
  Load,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
} from '../ast/instr.js';
import { Cmd, Line, Input, Program } from '../ast/index.js';

import { throws } from './helpers/exceptions.mjs';
import { FILENAME } from './helpers/files.mjs';
import { parseInput, parseProgram } from './helpers/parser.mjs';

const EXPRESSIONS: Array<[string, Instr]> = [
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

const WARNED_EXPRESSIONS: Array<[string, Instr]> = [
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

const IDENT_EXPRESSIONS: Array<[string, Expression]> = [
  [
    'i%',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.IntIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i%',
          value: 'i%',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i!',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.RealIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i!',
          value: 'i!',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i?',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.BoolIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i?',
          value: 'i?',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i$',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.StringIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i$',
          value: 'i$',
        }),
      ),
      0,
      2,
    ),
  ],
];

for (const [source, instr] of EXPRESSIONS) {
  t.test(`non-numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  t.test(`numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    instr.offsetStart += 4;
    instr.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
  });
}

for (const [source, instr] of WARNED_EXPRESSIONS) {
  t.test(`non-numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(source);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  t.test(`numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(`100 ${source}`);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    instr.offsetStart += 4;
    instr.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
  });
}

for (const [source, instr] of IDENT_EXPRESSIONS) {
  t.test(`non-numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  t.test(`numbered expression ${source}`, async (t: Test) => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    instr.offsetStart += 4;
    instr.offsetEnd += 4;
    (instr.expression as any).ident.index += 4;
    (instr.expression as any).ident.offsetStart += 4;
    (instr.expression as any).ident.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
    (instr.expression as any).ident.index -= 4;
    (instr.expression as any).ident.offsetStart -= 4;
    (instr.expression as any).ident.offsetEnd -= 4;
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
      new Cmd(10, 1, Source.command(source), [
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
      new Line(100, 1, new Source('', '100', ' ', "'\\q'"), [
        new Expression(new StringLiteral('\\q'), 4, 8),
      ]),
    ]),
  );
  t.matchSnapshot(formatter.format(warning));
});

t.test('print instruction', async (t: Test) => {
  await t.test('non-numbered', async (t: Test) => {
    const source = 'print "hello world"';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
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
        new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world'), 4, 23),
        ]),
      ]),
    );
  });

  await t.test('non-numbered, without arguments', async (t: Test) => {
    throws(t, () => {
      parseInput('print');
    });
  });

  await t.test('numbered, without arguments', async (t: Test) => {
    throws(t, () => {
      parseInput('100 print');
    });
  });
});

t.test('exit instruction', async (t: Test) => {
  await t.test('non-numbered', async (t: Test) => {
    const source = 'exit 0';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Exit(new IntLiteral(0), 0, 6),
        ]),
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
        new Line(100, 1, new Source('', '100', ' ', 'exit 0'), [
          new Exit(new IntLiteral(0), 4, 10),
        ]),
      ]),
    );
  });

  await t.test('non-numbered, without arguments', async (t: Test) => {
    const source = 'exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new Exit(null, 0, 4)]),
      ]),
    );
  });

  await t.test('numbered, without arguments', async (t: Test) => {
    const source = '100 exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', 'exit'), [
          new Exit(null, 4, 8),
        ]),
      ]),
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
        new Cmd(10, 1, Source.command(source), [
          new Rem('this is a comment', 0, 21),
        ]),
      ]),
    );
  });

  await t.test('bare, empty remark', async (t: Test) => {
    const source = 'rem';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [new Rem('', 0, 3)])]),
    );
  });

  await t.test('bare semicolong', async (t: Test) => {
    const source = ';';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [new Rem('', 0, 1)])]),
    );
  });

  await t.test('remark following a instruction', async (t: Test) => {
    const source = 'print 1 rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 8, 29),
        ]),
      ]),
    );
  });

  await t.test('remark as a second instruction', async (t: Test) => {
    const source = 'print 1 : rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 10, 31),
        ]),
      ]),
    );
  });
});

t.test('load', async (t: Test) => {
  await t.test('load with filename', async (t: Test) => {
    const source = 'load "./examples/001-hello-world.bas"';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            new StringLiteral('./examples/001-hello-world.bas'),
            false,
            0,
            37,
          ),
        ]),
      ]),
    );
  });

  await t.test('load with filename and --run', async (t: Test) => {
    const source = 'load "./examples/001-hello-world.bas" --run';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            new StringLiteral('./examples/001-hello-world.bas'),
            true,
            0,
            43,
          ),
        ]),
      ]),
    );
  });

  await t.test('load with filename and --no-run', async (t: Test) => {
    const source = 'load "./examples/001-hello-world.bas" --no-run';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Load(
            new StringLiteral('./examples/001-hello-world.bas'),
            false,
            0,
            46,
          ),
        ]),
      ]),
    );
  });

  await t.test('load with no filename', async (t: Test) => {
    const source = 'load';
    throws(t, () => {
      parseInput(source);
    });
  });

  await t.test('load with two positional arguments', async (t: Test) => {
    const source = 'load "./examples/001-hello-world.bas" "extra"';
    throws(t, () => {
      parseInput(source);
    });
  });
});

t.test('let', async (t: Test) => {
  const source = 'let i% = 1';
  const result = parseInput(source);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Let(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 4,
              row: 1,
              offsetStart: 4,
              offsetEnd: 6,
              text: 'i%',
              value: 'i%',
            }),
          ),
          new IntLiteral(1),
          0,
          10,
        ),
      ]),
    ]),
  );
});

t.test('assign', async (t: Test) => {
  const source = 'i% = 1';
  const result = parseInput(source);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Assign(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 0,
              row: 1,
              offsetStart: 0,
              offsetEnd: 2,
              text: 'i%',
              value: 'i%',
            }),
          ),
          new IntLiteral(1),
          0,
          6,
        ),
      ]),
    ]),
  );
});

t.test('short if', async (t: Test) => {
  await t.test('full short if', async (t: Test) => {
    const source = 'if true then print "true" else print "false" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [new Print(new StringLiteral('false'), 31, 44)],
            0,
            50,
          ),
        ]),
      ]),
    );
  });

  await t.test('no-else short if', async (t: Test) => {
    const source = 'if true then print "true" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [],
            0,
            31,
          ),
        ]),
      ]),
    );
  });

  await t.test('nested then/if in short if', async (t: Test) => {
    const source =
      'if true then if false then print "true and false" endif else print "false" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [
              new ShortIf(
                new BoolLiteral(false),
                [new Print(new StringLiteral('true and false'), 27, 49)],
                [],
                13,
                55,
              ),
            ],
            [new Print(new StringLiteral('false'), 61, 74)],
            0,
            80,
          ),
        ]),
      ]),
    );
  });

  await t.test('nested else/if in short if', async (t: Test) => {
    const source =
      'if true then print "true" else if false then print "false and false" endif endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [
              new ShortIf(
                new BoolLiteral(false),
                [new Print(new StringLiteral('false and false'), 45, 68)],
                [],
                31,
                74,
              ),
            ],
            0,
            80,
          ),
        ]),
      ]),
    );
  });
});

t.test('long if', async (t: Test) => {
  await t.test('if/endif', async (t: Test) => {
    const source = ['10 if true then', '20   print "true"', '30 endif'];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });

  await t.test('if/else/endif', async (t: Test) => {
    const source = [
      '10 if true then',
      '20   print "true"',
      '30 else',
      '40   print "false"',
      '50 endif',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'else'), [new Else(3, 7)]),
        new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
          new Print(new StringLiteral('false'), 5, 18),
        ]),
        new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });

  await t.test('if/elseif/endif', async (t: Test) => {
    const source = [
      '10 if true then',
      '20   print "true"',
      '30 else if false then',
      '40   print "false"',
      '50 endif',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'else if false then'), [
          new ElseIf(new BoolLiteral(false), 3, 21),
        ]),
        new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
          new Print(new StringLiteral('false'), 5, 18),
        ]),
        new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf(3, 8)]),
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

  t.same(
    result[0],
    new Input([new Line(100, 1, new Source('', '100', '', ''), [])]),
  );
});

t.test('multiple inputs', async (t: Test) => {
  const source = ['100 print "hello world"', '"foo"', '200 print "goodbye"'];
  const result = parseInput(source.join('\n'));

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([
      new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new Cmd(10, 2, Source.command('"foo"'), [
        new Expression(new StringLiteral('foo'), 0, 5),
      ]),
      new Line(200, 3, new Source('', '200', ' ', 'print "goodbye"'), [
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
// - attempt to parse instructions
// - parse the *first* instruction
// - fall through to an expression statement
// - fail to parse a valid expression statement
//
// We would need to track that we just parsed a line number (isLine), that
// we're parsing the very first instruction, and that we're parsing an expression
// statement. That's a boatload of state, but I think it's doable.
t.test('bare expression starting with an integer', async (t: Test) => {
  throws(t, () => {
    parseInput('1 + 1');
  });
});

t.test('simple program', async (t: Test) => {
  const source = ['100 print "hello world"', '200 print "goodbye"'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);

  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new Line(200, 2, new Source('', '200', ' ', 'print "goodbye"'), [
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
      new Line(100, 2, new Source('', '100', ' ', 'print "goodbye"'), [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
      new Line(200, 1, new Source('', '200', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
    ]),
  );
});

t.test('program with non-numbered input', async (t: Test) => {
  throws(t, () => {
    parseProgram(
      '100 print "hello world"\n"foo"\n200 print "goodbye"',
      FILENAME,
    );
  });
});

t.test('program with a negative line number', async (t: Test) => {
  throws(t, () => {
    parseProgram(
      '100 print "hello world"\n-100 "foo"\n200 print "goodbye"',
      FILENAME,
    );
  });
});

t.test('accidentally an entire semicolon', async (t: Test) => {
  throws(t, () => {
    parseInput('print 1 + 1;');
  });
});
