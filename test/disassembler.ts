import t from 'tap';
import { Test } from 'tap';

import { OpCode } from '../bytecode/opcodes';
import { disassemble } from '../bytecode/disassembler';

import { chunk } from './helpers/bytecode';

t.test('expressions', async (t: Test) => {
  await t.test('255', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [255],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('123.456', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [123.456],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`${bool}`, async (t: Test) => {
      t.matchSnapshot(
        disassemble(
          chunk({
            constants: [bool],
            code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
            lines: [-1, -1, -1, -1, -1],
          }),
        ),
      );
    });
  }

  await t.test('nil', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [],
          code: [OpCode.Nil, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('"hello world"', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: ['hello world'],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('(1)', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [1],
          code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('1 + 1', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
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
      ),
    );
  });

  await t.test('-1', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
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
          lines: [-1, -1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('1 : 1', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [1, 1],
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
          lines: [-1, -1, -1, -1, -1, -1, -1, -1],
        }),
      ),
    );
  });
});

t.test('print', async (t: Test) => {
  await t.test('print 255', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [255],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('print 123.456', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [123.456],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  for (const bool of [true, false]) {
    await t.test(`print ${bool}`, async (t: Test) => {
      t.matchSnapshot(
        disassemble(
          chunk({
            constants: [bool],
            code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
            lines: [-1, -1, -1, -1, -1],
          }),
        ),
      );
    });
  }

  await t.test('print nil', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [],
          code: [OpCode.Nil, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('print "hello world"', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: ['hello world'],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('print (1)', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
        chunk({
          constants: [1],
          code: [OpCode.Constant, 0, OpCode.Print, OpCode.Nil, OpCode.Return],
          lines: [-1, -1, -1, -1, -1],
        }),
      ),
    );
  });

  await t.test('print 1 + 1', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
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
      ),
    );
  });

  await t.test('print i% + 1', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
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
      ),
    );
  });

  await t.test('let i% = 1', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
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
      ),
    );
  });

  await t.test('i% = 1', async (t: Test) => {
    t.matchSnapshot(
      disassemble(
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
      ),
    );
  });
});

t.test('simple program', async (t: Test) => {
  t.matchSnapshot(
    disassemble(
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
    ),
  );
});

t.test('malformed lines', async (t: Test) => {
  t.matchSnapshot(
    disassemble(
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [],
      }),
    ),
  );
});

t.test('missing constants', async (t: Test) => {
  t.matchSnapshot(
    disassemble(
      chunk({
        constants: [],
        code: [OpCode.Constant, 0, OpCode.Pop, OpCode.Nil, OpCode.Return],
        lines: [-1, -1, -1, -1, -1],
      }),
    ),
  );
});

t.test('unknown opcode', async (t: Test) => {
  t.matchSnapshot(
    disassemble(
      chunk({
        constants: [],
        // It's over nine thousand!!!
        code: [9001 as OpCode],
        lines: [-1],
      }),
    ),
  );
});
