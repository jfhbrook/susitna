import t from 'tap';
import { Test } from 'tap';

import { executorTopic as topic } from './helpers/executor.mjs';

t.test('when prompted for a command', async (t: Test) => {
  await t.test('it gets a command', async (t: Test) => {
    await topic.swear(async ({ executor, host }) => {
      const command = await host.expect(
        t,
        executor.prompt(),
        'print "hello world"',
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
        'blue',
      );

      t.equal(input, 'blue');
    });
  });
});

t.test('when history is saved', async (t: Test) => {
  await t.test('and the history is long', async (t: Test) => {
    await t.test('history is saved', async (t: Test) => {
      await topic.swear(async ({ executor, host }) => {
        (executor as any).history = [];
        for (let i = 0; i < 1000; i++) {
          (executor as any).history.push(`print ${i}`);
        }

        await executor.saveHistory();

        t.matchSnapshot(host.files['/home/josh/.matbas_history']);
      });
    });
  });
});
