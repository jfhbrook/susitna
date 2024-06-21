import t from 'tap';
import { Test } from 'tap';

import { Print, Exit, Expression } from '../ast/cmd';
import {
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
import { OpCode } from '../bytecode/opcodes';
import { compile } from '../compiler';
import { formatter } from '../format';
import { TokenKind } from '../tokens';

import { chunk } from './helpers/bytecode';

t.skip('expressions', async (t: Test) => {
  await t.test('255', async (t: Test) => {
    t.same(
      compile(new Expression(new IntLiteral(255))),
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  await t.test('123.456', async (t: Test) => {
    t.same(
      compile(new Expression(new RealLiteral(123.456))),
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`${bool}`, async (t: Test) => {
      t.same(
        compile(new Expression(new BoolLiteral(bool))),
        chunk({
          constants: [bool],
          code: [OpCode.Constant, 0, OpCode.Return],
          lines: [-1, -1, -1],
        }),
      );
    });
  }

  await t.test('nil', async (t: Test) => {
    t.same(
      compile(new Expression(new NilLiteral())),
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Return],
        lines: [-1, -1],
      }),
    );
  });

  await t.test('"hello world"', async (t: Test) => {
    t.same(
      compile(new Expression(new StringLiteral('hello world'))),
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  await t.test('(1)', async (t: Test) => {
    t.same(
      compile(new Expression(new Group(new IntLiteral(1)))),
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  await t.test('1 + 1', async (t: Test) => {
    t.same(
      compile(
        new Expression(
          new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
        ),
      ),
      chunk({
        constants: [1, 1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          OpCode.Return,
        ],
        lines: [-1, -1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('-1', async (t: Test) => {
    t.same(
      compile(new Expression(new Unary(TokenKind.Minus, new IntLiteral(1)))),
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Neg, OpCode.Return],
        lines: [-1, -1, -1, -1],
      }),
    );
  });

  await t.skip('1 : 1', async (t: Test) => {
    t.same(
      compile(new Expression(new IntLiteral(255))),
      chunk({
        constants: [1, 1],
        code: [
          // TODO: Bare expressions should pop UNLESS they're the last
          // expression in an interactive command
          OpCode.Constant,
          0,
          OpCode.Pop,
          OpCode.Constant,
          1,
          OpCode.Return,
        ],
        lines: [-1, -1, -1, -1, -1, -1],
      }),
    );
  });
});

t.test('print', async (t: Test) => {
  await t.test('print 255', async (t: Test) => {
    t.same(
      compile(new Print(new IntLiteral(255))),
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('print 123.456', async (t: Test) => {
    t.same(
      compile(new Print(new RealLiteral(123.456))),
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`print ${bool}`, async (t: Test) => {
      t.same(
        compile(new Print(new BoolLiteral(bool))),
        chunk({
          constants: [bool],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      );
    });
  }

  await t.test('print nil', async (t: Test) => {
    t.same(
      compile(new Print(new NilLiteral())),
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1],
      }),
    );
  });

  await t.test('print "hello world"', async (t: Test) => {
    t.same(
      compile(new Print(new StringLiteral('hello world'))),
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('print (1)', async (t: Test) => {
    t.same(
      compile(new Print(new Group(new IntLiteral(1)))),
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('print 1 + 1', async (t: Test) => {
    t.same(
      compile(
        new Print(
          new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
        ),
      ),
      chunk({
        constants: [1, 1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          OpCode.Print,
          OpCode.Nil,
          OpCode.Return,
        ],
        lines: [-1, -1, -1, -1, -1, -1, -1, -1],
      }),
    );
  });
});

t.test('exit', async (t: Test) => {
  await t.test('exit 255', async (t: Test) => {
    t.same(
      compile(new Exit(new IntLiteral(255))),
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('exit 123.456', async (t: Test) => {
    t.same(
      compile(new Exit(new RealLiteral(123.456))),
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`exit ${bool}`, async (t: Test) => {
      t.same(
        compile(new Exit(new BoolLiteral(bool))),
        chunk({
          constants: [bool],
          code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      );
    });
  }

  await t.test('exit nil', async (t: Test) => {
    t.same(
      compile(new Exit(new NilLiteral())),
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1],
      }),
    );
  });

  await t.test('exit "hello world"', async (t: Test) => {
    t.same(
      compile(new Exit(new StringLiteral('hello world'))),
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('exit (1)', async (t: Test) => {
    t.same(
      compile(new Exit(new Group(new IntLiteral(1)))),
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('exit 1 + 1', async (t: Test) => {
    t.same(
      compile(
        new Exit(
          new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
        ),
      ),
      chunk({
        constants: [1, 1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          OpCode.Exit,
          OpCode.Nil,
          OpCode.Return,
        ],
        lines: [-1, -1, -1, -1, -1, -1, -1, -1],
      }),
    );
  });
});

t.test('simple program', async (t: Test) => {
  t.same(
    compile(
      new Program([
        new Line(100, [new Print(new StringLiteral('hello world'))]),
        new Line(200, [new Print(new StringLiteral('goodbye'))]),
      ]),
    ),
    chunk({
      constants: ['hello world', 'goodbye'],
      code: [
        OpCode.Constant,
        0,
        OpCode.Print,
        OpCode.Constant,
        1,
        OpCode.Print,
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [100, 100, 100, 200, 200, 200, 200, 200],
    }),
  );
});

t.test('syntax errors', async (t: Test) => {
  await t.test('*1', async (t: Test) => {
    t.plan(2);
    t.throws(() => {
      try {
        compile(new Expression(new Unary(TokenKind.Star, new IntLiteral(1))));
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
          ),
        );
      } catch (err) {
        t.matchSnapshot(formatter.format(err));
        throw err;
      }
    });
  });
});
