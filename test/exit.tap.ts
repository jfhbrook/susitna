import t from 'tap';
import { Test } from 'tap';

import { Exit, ExitCode } from '../exit';

t.test('Exit', async (t: Test) => {
  t.test('when there is a code and message', async (t: Test) => {
    t.test(`it can construct an Exit`, async (t: Test) => {
      const exit = new Exit(ExitCode.Success, 'huge success');

      t.ok(exit);
      t.equal(exit.message, 'huge success');
      t.type(exit, Error);
      t.type(exit, Exit);
      t.equal(exit.exitCode, ExitCode.Success);
    });
  });

  t.test('when there is a code but not a message', async (t: Test) => {
    t.test(`it can construct an Exit`, async (t: Test) => {
      const exit = new Exit(ExitCode.Software);

      t.ok(exit);
      t.equal(exit.message, '');
      t.type(exit, Error);
      t.type(exit, Exit);
      t.equal(exit.exitCode, ExitCode.Software);
    });
  });

  t.test('when there is neither a code nor a message', async (t: Test) => {
    t.test(`it can construct an Exit`, async (t: Test) => {
      const exit = new Exit();

      t.ok(exit);
      t.equal(exit.message, '');
      t.type(exit, Error);
      t.type(exit, Exit);
      t.equal(exit.exitCode, ExitCode.Success);
    });
  });
});
