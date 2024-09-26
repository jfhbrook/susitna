import t from 'tap';
import { Test } from 'tap';

import {
  Instr,
  Print,
  Exit,
  Expression,
  Rem,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  EndIf,
} from '../ast/instr';
import {
  Expr,
  Binary,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  Unary,
  NilLiteral,
} from '../ast/expr';
import { Program, Line } from '../ast';
import { addrToBytes } from '../bytecode/address';
import { Chunk } from '../bytecode/chunk';
import { OpCode } from '../bytecode/opcodes';
import {
  compileInstruction,
  compileCommands,
  CompiledCmd,
  compileProgram,
  CompilerOptions,
  CompileResult,
} from '../compiler';
import { formatter } from '../format';
import { Token, TokenKind } from '../tokens';

import { chunk } from './helpers/bytecode';
import { FILENAME } from './helpers/files';

function compile(
  ast: Program | Instr,
  options: CompilerOptions = {},
): CompileResult<Chunk> {
  if (ast instanceof Program) {
    return compileProgram(ast, options);
  } else {
    return compileInstruction(ast, options);
  }
}

type TestCase = [string, Instr | Program, Chunk];

const EXPRESSION_STATEMENTS: TestCase[] = [
  [
    '255',
    new Expression(new IntLiteral(255)),
    chunk({
      constants: [255],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    '123.456',
    new Expression(new RealLiteral(123.456)),
    chunk({
      constants: [123.456],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    'true',
    new Expression(new BoolLiteral(true)),
    chunk({
      constants: [true],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    'false',
    new Expression(new BoolLiteral(false)),
    chunk({
      constants: [false],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    'nil',
    new Expression(new NilLiteral()),
    chunk({
      constants: [],
      code: [OpCode.Nil],
      lines: [100],
    }),
  ],
  [
    '"hello world"',
    new Expression(new StringLiteral('hello world')),
    chunk({
      constants: ['hello world'],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    '(1)',
    new Expression(new Group(new IntLiteral(1))),
    chunk({
      constants: [1],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],

  [
    '1 + 1',
    new Expression(
      new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
    ),
    chunk({
      constants: [1, 1],
      code: [OpCode.Constant, 0, OpCode.Constant, 1, OpCode.Add],
      lines: [100, 100, 100, 100, 100],
    }),
  ],

  [
    '100',
    new Expression(new Unary(TokenKind.Minus, new IntLiteral(1))),
    chunk({
      constants: [1],
      code: [OpCode.Constant, 0, OpCode.Neg],
      lines: [100, 100, 100],
    }),
  ],

  [
    'i% + 1',
    new Expression(
      new Binary(
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
        TokenKind.Plus,
        new IntLiteral(1),
      ),
    ),
    chunk({
      constants: ['i%', 1],
      code: [
        OpCode.Constant,
        0,
        OpCode.GetGlobal,
        0,
        OpCode.Constant,
        1,
        OpCode.Add,
      ],
      lines: [100, 100, 100, 100, 100, 100, 100],
    }),
  ],
];

type InstrCtor<C> = { new <E extends Expr>(expr: E): C };

function commandExpr1Cases<C extends Instr>(
  name: string,
  cmd: InstrCtor<C>,
  code: OpCode,
): TestCase[] {
  return [
    [
      `${name} 225`,
      new cmd(new IntLiteral(255)),
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} 123.456`,
      new cmd(new IntLiteral(123.456)),
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} true`,
      new cmd(new BoolLiteral(true)),
      chunk({
        constants: [true],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} false`,
      new cmd(new BoolLiteral(false)),
      chunk({
        constants: [false],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} nil`,
      new cmd(new NilLiteral()),
      chunk({
        constants: [],
        code: [OpCode.Nil, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100],
      }),
    ],
    [
      `${name} "hello world"`,
      new cmd(new StringLiteral('hello world')),
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} (1)`,
      new cmd(new Group(new IntLiteral(1))),
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],

    [
      `${name} 1 + 1`,
      new cmd(new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1))),
      chunk({
        constants: [1, 1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          code,
          OpCode.Nil,
          OpCode.Return,
        ],
        lines: [100, 100, 100, 100, 100, 100, 100, 100],
      }),
    ],
  ];
}

// Expressions are handled differently in Programs versus other commands,
// so we leave them off when building out programs from the other commands,
// and append them to COMMANDS afterwards.
const EXPRESSION_COMMANDS = EXPRESSION_STATEMENTS.map(
  ([source, ast, { constants, code, lines }]): TestCase => {
    return [
      source,
      ast,
      chunk({
        constants,
        code: code.concat([OpCode.Return]),
        lines: lines.concat([100]),
      }),
    ];
  },
);

let COMMANDS: TestCase[] = [
  ...commandExpr1Cases('print', Print, OpCode.Print),
  ...commandExpr1Cases('exit', Exit, OpCode.Exit),
  [
    'let i% = 1',
    new Let(
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
    ),
    chunk({
      constants: ['i%', 1],
      code: [
        OpCode.Constant,
        0,
        OpCode.Constant,
        1,
        OpCode.DefineGlobal,
        0,
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [100, 100, 100, 100, 100, 100, 100, 100],
    }),
  ],
  [
    'i% = 1',
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
    ),
    chunk({
      constants: ['i%', 1],
      code: [
        OpCode.Constant,
        0,
        OpCode.Constant,
        1,
        OpCode.SetGlobal,
        0,
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [100, 100, 100, 100, 100, 100, 100, 100],
    }),
  ],
  [
    'if true then print "true" else print "false" endif',
    new ShortIf(
      new BoolLiteral(true),
      [new Print(new StringLiteral('true'))],
      [new Print(new StringLiteral('false'))],
    ),
    chunk({
      constants: [true, 'true', 'false'],
      code: [
        OpCode.Constant,
        0,
        // Jump to "else"
        OpCode.JumpIfFalse,
        ...addrToBytes(7),
        // "then" block
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Print,
        // Jump to end
        OpCode.Jump,
        ...addrToBytes(4),
        // "else" block
        OpCode.Pop,
        OpCode.Constant,
        2,
        OpCode.Print,
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100,
      ],
    }),
  ],
];

const PROGRAMS: TestCase[] = [
  ...EXPRESSION_STATEMENTS.map(
    ([source, ast, { constants, code, lines }]): TestCase => {
      return [
        `100 ${source}`,
        new Program(FILENAME, [
          new Line(100, 1, `100 ${source}`, [ast as Instr]),
        ]),
        chunk({
          constants,
          code: code.concat([OpCode.Pop, OpCode.Nil, OpCode.Return]),
          lines: lines.concat([100, 100, 100]),
        }),
      ];
    },
  ),
  ...COMMANDS.map(([source, ast, { constants, code, lines }]): TestCase => {
    return [
      `100 ${source}`,
      new Program(FILENAME, [
        new Line(100, 1, `100 ${source}`, [ast as Instr]),
      ]),
      chunk({
        constants,
        code,
        lines,
      }),
    ];
  }),
  [
    '100 1 : 1',
    new Program(FILENAME, [
      new Line(100, 1, '100 1 : 1', [
        new Expression(new IntLiteral(1)),
        new Expression(new IntLiteral(255)),
      ]),
    ]),
    chunk({
      constants: [1, 255],
      code: [
        OpCode.Constant,
        0,
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Pop,
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [100, 100, 100, 100, 100, 100, 100, 100],
    }),
  ],
  [
    [
      '10 if true then',
      '20   print "true"',
      '30 else',
      '40   print "false"',
      '50 endif',
    ].join('\n'),
    new Program(FILENAME, [
      new Line(10, 1, '10 if true then', [new If(new BoolLiteral(true))]),
      new Line(20, 2, '20   print "true"', [
        new Print(new StringLiteral('true')),
      ]),
      new Line(30, 3, '30 else', [new Else()]),
      new Line(40, 4, '40   print "false"', [
        new Print(new StringLiteral('false')),
      ]),
      new Line(50, 5, '50 endif', [new EndIf()]),
    ]),
    chunk({
      constants: [true, 'true', 'false'],
      code: [
        OpCode.Constant,
        0,
        // Jump to "else"
        OpCode.JumpIfFalse,
        ...addrToBytes(7),
        // "then" block
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Print,
        // Jump to end
        OpCode.Jump,
        ...addrToBytes(4),
        // "else" block
        OpCode.Pop,
        OpCode.Constant,
        2,
        OpCode.Print,
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [
        10, 10, 10, 10, 10, 10, 20, 20, 20, 30, 30, 30, 30, 40, 40, 40, 50, 50,
      ],
    }),
  ],
];

COMMANDS = COMMANDS.concat(EXPRESSION_COMMANDS);

function runTest([source, ast, ch]: TestCase): void {
  t.test(source, async (t: Test) => {
    t.same(compile(ast)[0], ch);
  });
}

for (const cmd of COMMANDS) {
  runTest(cmd);
}

for (const prog of PROGRAMS) {
  runTest(prog);
}

t.test('syntax errors', async (t: Test) => {
  await t.test('*1', async (t: Test) => {
    t.plan(2);
    t.throws(() => {
      try {
        compile(
          new Expression(new Unary(TokenKind.Star, new IntLiteral(1)), 0, 2),
          { filename: '<input>', cmdSource: '*1' },
        );
      } catch (err) {
        t.matchSnapshot(formatter.format(err));
        throw err;
      }
    });
  });

  await t.test('1 $ 1', async (t: Test) => {
    t.plan(2);
    t.throws(() => {
      try {
        compile(
          new Expression(
            new Binary(new IntLiteral(1), TokenKind.Dollar, new IntLiteral(1)),
            0,
            5,
          ),
          { filename: '<input>', cmdSource: '1 $ 1' },
        );
      } catch (err) {
        t.matchSnapshot(formatter.format(err));
        throw err;
      }
    });
  });
});

async function isCompiled(
  t: Test,
  name: string,
  [cmd, chunks]: CompiledCmd,
): Promise<void> {
  await t.test(name, async (t: Test) => {
    t.equal(cmd, null, 'is a runtime instruction');
    t.equal(chunks.length, 1, 'chunk is compiled');
  });
}

async function isInteractive(
  t: Test,
  name: string,
  cmd: CompiledCmd,
): Promise<void> {
  await t.test(name, async (t: Test) => {
    t.ok(cmd, 'is an interactive command');
    t.matchSnapshot(cmd, 'has the expected arguments');
  });
}

t.test('interactive compiler', async (t: Test) => {
  const [cmds, warning] = compileCommands([
    new Print(new StringLiteral('Hello')),
    new Exit(null),
    new Rem('A witty remark.'),
    new Expression(new StringLiteral('Hello')),
  ]);

  t.equal(cmds.length, 3, 'rem is filtered out');

  const [print, exit, expr] = cmds;

  t.equal(warning, null, 'has no warnings');

  await isCompiled(t, 'print', print);
  await isCompiled(t, 'exit', exit);
  await isInteractive(t, 'expression', expr);
});
