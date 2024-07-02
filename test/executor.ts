import t from 'tap';
import { Test } from 'tap';

import { MockInputStream, MockOutputStream } from './helpers/host';
import { executorTopic as topic } from './helpers/executor';

async function expect<T>(
  t: Test,
  action: Promise<T>,
  input: string,
  inputStream: MockInputStream,
  outputStream: MockOutputStream,
): Promise<T> {
  inputStream.write(`${input}\n`);

  const rv = await action;

  t.matchSnapshot(outputStream.output);

  return rv;
}

t.test('when prompted for a command', async (t: Test) => {
  await t.test('it gets a command', async (t: Test) => {
    await topic.swear(async ({ executor, host }) => {
      const command = await expect(
        t,
        executor.prompt(),
        'print "hello world"',
        host.inputStream,
        host.outputStream,
      );
      t.equal(command, 'print "hello world"');
    });
  });
});

t.test('when input is requested', async (t: Test) => {
  await t.test('input is received?', async (t: Test) => {
    await topic.swear(async ({ executor, host }) => {
      const input = await expect(
        t,
        executor.input('what is your favorite color?'),
        'blue',
        host.inputStream,
        host.outputStream,
      );

      t.matchSnapshot(host.outputStream.output);
      t.equal(input, 'blue');
    });
  });
});
