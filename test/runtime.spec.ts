import { describe, test } from 'vitest';
import { t } from './helpers/tap';

import { NotImplementedError } from '../exceptions';
import { OpCode } from '../bytecode/opcodes';

import { chunk } from './helpers/bytecode';
import { testChunk } from './helpers/runtime';

describe('expressions', () => {
  test('255', () => {
    testChunk(
      t,
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  test('123.456', () => {
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
    test(`${bool}`, () => {
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

  test('nil', () => {
    testChunk(
      t,
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  test('"hello world"', () => {
    testChunk(
      t,
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  test('(1)', () => {
    testChunk(
      t,
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1],
      }),
    );
  });

  test('1 + 1', () => {
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

  test('-1', () => {
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

  test('1 : 1', () => {
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

describe('print', () => {
  test('print 255', () => {
    testChunk(
      t,
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  test('print 123.456', () => {
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
    test(`print ${bool}`, () => {
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

  test('print nil', () => {
    testChunk(
      t,
      chunk({
        constants: [],
        code: [OpCode.Nil, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  test('print "hello world"', () => {
    testChunk(
      t,
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  test('print (1)', () => {
    testChunk(
      t,
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    );
  });

  test('print 1 + 1', () => {
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

describe('exit', () => {
  test('exit 1', () => {
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

  test('exit 100', () => {
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

  test('exit "banana"', () => {
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

  test('exit 123.456', () => {
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

  test('exit true', () => {
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

  test('exit false', () => {
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

  test('exit nil', () => {
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

  test('exit 1 + 1', () => {
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

test('simple program', () => {
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

test('something not implemented', () => {
  testChunk(
    t,
    chunk({
      constants: [],
      code: [OpCode.Loop, 0xff, 0xff],
      lines: [100],
    }),
    {
      throws: NotImplementedError,
    },
  );
});
