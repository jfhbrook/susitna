import t from 'tap';
import { Test } from 'tap';

import { NotImplementedError } from '../exceptions';
import { OpCode } from '../bytecode/opcodes';

import { chunk } from './helpers/bytecode';
import { testChunk } from './helpers/runtime';

t.test('expressions', async (t: Test) => {
  await t.test('255', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  await t.test('123.456', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`${bool}`, async (t: Test) => {
      testChunk(
        t,
        chunk({
          constants: [bool],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      );
    });
  }

  await t.test('nil', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('"hello world"', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('(1)', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  await t.test('1 + 1', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [1, 1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          OpCode.Pop,
          OpCode.Nil,
          OpCode.Return,
        ],
        lines: [-1, -1, -1, -1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('-1', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Neg,
          OpCode.Pop,
          OpCode.Nil,
          OpCode.Return,
        ],
        lines: [-1, -1, -1, -1],
      }),
    );
  });

  await t.test('1 : 1', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [1, 1],
        code: [
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
    testChunk(
      t,
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('print 123.456', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1, -1],
      }),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`print ${bool}`, async (t: Test) => {
      testChunk(
        t,
        chunk({
          constants: [bool],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      );
    });
  }

  await t.test('print nil', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('print "hello world"', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('print (1)', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  await t.test('print 1 + 1', async (t: Test) => {
    testChunk(
      t,
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
        lines: [-1, -1, -1, -1, -1, -1, -1],
      }),
    );
  });
});

t.test('exit', async (t: Test) => {
  await t.test('exit 1', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
      {
        exitCode: 1,
      },
    );
  });

  await t.test('exit 100', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [100],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
      {
        exitCode: 100,
      },
    );
  });

  await t.test('exit "banana"', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: ['banana'],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
      {
        exitCode: 1,
      },
    );
  });

  await t.test('exit 123.456', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1, -1],
      }),
      {
        exitCode: 123,
      },
    );
  });

  await t.test('exit true', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [true],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1, -1],
      }),
      {
        exitCode: 1,
      },
    );
  });

  await t.test('exit false', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [false],
        code: [OpCode.Constant, 0, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1, -1],
      }),
      {
        exitCode: 0,
      },
    );
  });

  await t.test('exit nil', async (t: Test) => {
    testChunk(
      t,
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Exit, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
      {
        exitCode: 0,
      },
    );
  });

  await t.test('exit 1 + 1', async (t: Test) => {
    testChunk(
      t,
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
        lines: [-1, -1, -1, -1, -1, -1, -1],
      }),
      {
        exitCode: 2,
      },
    );
  });
});

t.test('simple program', async (t: Test) => {
  testChunk(
    t,
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

t.test('something not implemented', async (t: Test) => {
  testChunk(
    t,
    chunk({
      constants: [],
      code: [OpCode.Jump],
      lines: [100],
    }),
    {
      throws: NotImplementedError,
    },
  );
});
