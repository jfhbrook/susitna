import { describe, test } from 'vitest';
import { t } from './helpers/tap';

import { executorTopic as topic } from './helpers/executor';

describe('when prompted for a command', () => {
  test('it gets a command', async () => {
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

describe('when input is requested', () => {
  test('input is received?', async () => {
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

describe('when history is saved', () => {
  describe('and the history is long', () => {
    test('history is saved', async () => {
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
