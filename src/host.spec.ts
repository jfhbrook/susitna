import t from 'tap';
import { discuss } from '@jfhbrook/swears';

import { ERASE_TO_END, moveCursorTo, TestConsoleHost } from './test/host';

const topic = discuss(
  async () => {
    const host = new TestConsoleHost();

    await host.init({});

    return host;
    // oh my God, am I going to have to finally publish to npm??
    // fucking LMAO
  },
  async (host) => {
    await host.close();
  },
);

t.test('when prompted for a command', async (t) => {
  t.test('it gets a command', async (t) => {
    await topic.swear(async (host) => {
      const prompt = host.prompt('> ');
      host.inputStream.write('print "hello world"\n');

      const command = await prompt;
      t.same(
        host.outputStream.output,
        `${moveCursorTo(1)}${ERASE_TO_END}> ${moveCursorTo(3)}print "hello world"\r\n`,
      );
      t.equal(command, 'print "hello world"');
    });
  });
});

t.test('when input is requested', async (t) => {
  t.test('input is received?', async (t) => {
    await topic.swear(async (host) => {
      const question = host.input('what is your favorite color?');
      host.inputStream.write('blue\n');

      const input = await question;

      t.same(
        host.outputStream.output,
        `${moveCursorTo(1)}${ERASE_TO_END}what is your favorite color? > ${moveCursorTo(32)}blue\r\n`,
      );
      t.equal(input, 'blue');
    });
  });
});
