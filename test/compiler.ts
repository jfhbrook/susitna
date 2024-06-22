import t from 'tap';
import { Test } from 'tap';

import { Cmd, Print, Exit, Expression } from '../ast/cmd';
import {
  Expr,
  Binary,
  Group,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  Unary,
  NilLiteral,
} from '../ast/expr';
import { Program, Line } from '../ast';
import { Chunk } from '../bytecode/chunk';
import { OpCode } from '../bytecode/opcodes';
import { compile } from '../compiler';
import { formatter } from '../format';
import { TokenKind } from '../tokens';

import { chunk } from './helpers/bytecode';

type TestCase = [string, Cmd | Program, Chunk];

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
];

type CmdCtor<C> = { new <E extends Expr>(expr: E): C };

function commandExpr1Cases<C extends Cmd>(
  name: string,
  cmd: CmdCtor<C>,
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
];

// TODO: Line numbers are set to 100 because the interactive command cases
// are defaulting them to 100. These should be set to 100, and the interactive
// command cases should also yield line 100 by default.

const PROGRAMS: TestCase[] = [
  ...EXPRESSION_STATEMENTS.map(
    ([source, ast, { constants, code, lines }]): TestCase => {
      return [
        `100 ${source}`,
        new Program([new Line(100, 1, `100 ${source}`, [ast as Cmd])]),
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
      new Program([new Line(100, 1, `100 ${source}`, [ast as Cmd])]),
      chunk({
        constants,
        code,
        lines,
      }),
    ];
  }),
  [
    '100 1 : 1',
    new Program([
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
];

COMMANDS = COMMANDS.concat(EXPRESSION_COMMANDS);

function runTest([source, ast, ch]: TestCase): void {
  t.test(source, async (t: Test) => {
    t.same(compile(ast), ch);
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
