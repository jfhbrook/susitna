import t from 'tap';
import { Test } from 'tap';

import { executorTopic as topic } from './helpers/executor';

t.test('when prompted for a command', async (t: Test) => {
  t.test('it gets a command', async (t: Test) => {
    await topic.swear(async ({ executor, host }) => {
      const prompt = executor.prompt();
      host.inputStream.write('print "hello world"\n');

      const command = await prompt;
      t.matchSnapshot(host.outputStream.output);
      t.equal(command, 'print "hello world"');
    });
  });
});

t.test('when input is requested', async (t: Test) => {
  t.test('input is received?', async (t: Test) => {
    await topic.swear(async ({ executor, host }) => {
      const question = executor.input('what is your favorite color?');
      host.inputStream.write('blue\n');

      const input = await question;
      t.matchSnapshot(host.outputStream.output);
      t.equal(input, 'blue');
    });
  });
});
