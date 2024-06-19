import t from 'tap';
import { Test } from 'tap';

import {
  Group,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from '../ast/expr';
import { Print, Expression } from '../ast/cmd';
import { Binary } from '../ast/expr';
import { TokenKind } from '../tokens';
import { chunk } from './helpers/bytecode';

import { compile } from '../compiler';
import { OpCode } from '../bytecode/opcodes';

t.test('expressions', async (t: Test) => {
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
        lines: [-1, -1, -1],
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
        // TODO: [... OpCode.Print, OpCode.Nil, OpCode.Return]
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Return],
        lines: [-1, -1, -1, -1],
      }),
    );
  });

  await t.test('print 123.456', async (t: Test) => {
    t.same(
      compile(new Print(new RealLiteral(123.456))),
      chunk({
        constants: [123.456],
        // TODO: [... OpCode.Print, OpCode.Nil, OpCode.Return]
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Return],
        lines: [-1, -1, -1, -1],
      }),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`print ${bool}`, async (t: Test) => {
      t.same(
        compile(new Print(new BoolLiteral(bool))),
        chunk({
          constants: [bool],
          // TODO: [... OpCode.Print, OpCode.Nil, OpCode.Return]
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Return],
          lines: [-1, -1, -1, -1],
        }),
      );
    });
  }

  await t.test('print nil', async (t: Test) => {
    t.same(
      compile(new Print(new NilLiteral())),
      chunk({
        constants: [],
        // TODO: [... OpCode.Print, OpCode.Nil, OpCode.Return]
        code: [OpCode.Nil, OpCode.Print, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  await t.test('print "hello world"', async (t: Test) => {
    t.same(
      compile(new Print(new StringLiteral('hello world'))),
      chunk({
        constants: ['hello world'],
        // TODO: [... OpCode.Print, OpCode.Nil, OpCode.Return]
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Return],
        lines: [-1, -1, -1, -1],
      }),
    );
  });

  await t.test('print (1)', async (t: Test) => {
    t.same(
      compile(new Print(new Group(new IntLiteral(1)))),
      chunk({
        constants: [1],
        // TODO: [... OpCode.Print, OpCode.Nil, OpCode.Return]
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Return],
        lines: [-1, -1, -1, -1],
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
        // TODO: [... OpCode.Print, OpCode.Nil, OpCode.Return]
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          OpCode.Print,
          OpCode.Return,
        ],
        lines: [-1, -1, -1, -1, -1, -1, -1],
      }),
    );
  });
});
