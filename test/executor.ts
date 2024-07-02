import t from 'tap';
import { Test } from 'tap';

import { executorTopic as topic } from './helpers/executor';

t.test('when prompted for a command', async (t: Test) => {
  await t.test('it gets a command', async (t: Test) => {
    await topic.swear(async ({ executor, host }) => {
      const command = await host.expect(
        t,
        executor.prompt(),
        'print "hello world"',
      );
      t.equal(command, 'print "hello world"');
    });
  });
});

t.test('when input is requested', async (t: Test) => {
  await t.test('input is received?', async (t: Test) => {
    await topic.swear(async ({ executor, host }) => {
      const input = await host.expect(
        t,
        executor.input('what is your favorite color?'),
        'blue',
      );

      t.matchSnapshot(host.outputStream.output);
      t.equal(input, 'blue');
    });
  });
});
