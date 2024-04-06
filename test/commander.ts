import t from 'tap';
import { Test } from 'tap';
import { discuss } from '@jfhbrook/swears';

import { Config } from '../config';
import { Commander } from '../commander';
import { Level } from '../host';
import { MockConsoleHost } from './helpers/host';

const topic = discuss(
  async () => {
    const config = new Config(null, null, null, Level.Info, ['matbas'], {});
    const host = new MockConsoleHost();
    const commander = new Commander(config, host);

    await commander.init();

    return { commander, host };
  },
  async ({ commander }) => {
    await commander.close();
  },
);

t.test('when prompted for a command', async (t: Test) => {
  t.test('it gets a command', async (t: Test) => {
    await topic.swear(async ({ commander, host }) => {
      const prompt = commander.prompt();
      host.inputStream.write('print "hello world"\n');

      const command = await prompt;
      t.matchSnapshot(host.outputStream.output);
      t.equal(command, 'print "hello world"');
    });
  });
});

t.test('when input is requested', async (t: Test) => {
  t.test('input is received?', async (t: Test) => {
    await topic.swear(async ({ commander, host }) => {
      const question = commander.input('what is your favorite color?');
      host.inputStream.write('blue\n');

      const input = await question;
      t.matchSnapshot(host.outputStream.output);
      t.equal(input, 'blue');
    });
  });
});
