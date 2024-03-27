import t from 'tap';
import { Test } from 'tap';
import { discuss } from '@jfhbrook/swears';

import { Level } from './host';
import { ERASE_TO_END, moveCursorTo, MockConsoleHost } from './test/host';

const topic = discuss(
  async () => {
    const host = new MockConsoleHost();

    await host.init({});

    return host;
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

const STREAM = {
  writeOut: 'outputStream',
  writeError: 'errorStream',
};

function outputTest(
  method: 'writeOut' | 'writeError',
): (t: Test) => Promise<void> {
  return async (t: Test): Promise<void> => {
    t.test('it writes to the stream', async (t) => {
      await topic.swear(async (host) => {
        host[method]('test');

        t.equal(host[STREAM[method]].output, 'test');
      });
    });
  };
}

t.test('when calling writeOut', outputTest('writeOut'));
t.test('when calling writeError', outputTest('writeError'));

const LOG_PREFIX = {
  writeDebug: 'DEBUG',
  writeInfo: 'INFO',
  writeWarn: 'WARN',
};

function logTest(
  method: 'writeDebug' | 'writeInfo' | 'writeWarn',
  level: Level,
): (t: Test) => Promise<void> {
  return async (t: Test): Promise<void> => {
    for (let setLevel of [0, 1, 2, 3]) {
      t.test(`at level ${setLevel}`, async (t) => {
        await topic.swear(async (host) => {
          host.setLevel(setLevel);
          host[method]('test');

          if (level >= setLevel) {
            t.test('it writes a message', async (t) => {
              t.equal(host.errorStream.output, `${LOG_PREFIX[method]}: test\n`);
            });
          } else {
            t.test('it suppresses the message', async (t) => {
              t.equal(host.errorStream.output, '');
            });
          }
        });
      });
    }
  };
}

t.test('when calling writeDebug', logTest('writeDebug', Level.Debug));
t.test('when calling writeInfo', logTest('writeInfo', Level.Info));
t.test('when calling writeWarn', logTest('writeWarn', Level.Warn));

function channelTest(
  channel: number,
  stream: 'outputStream' | 'errorStream',
  expected: string,
): (t: Test) => Promise<void> {
  return async (t: Test): Promise<void> => {
    await topic.swear(async (host) => {
      host.setLevel(Level.Debug);
      host.writeChannel(channel, 'test');

      t.test('it writes to that stream', async (t) => {
        t.equal(host[stream].output, expected);
      });
    });
  };
}

t.test('when writing to channel 1', channelTest(1, 'outputStream', 'test'));
t.test('when writing to channel 2', channelTest(2, 'errorStream', 'test'));
t.test(
  'when writing to channel 3',
  channelTest(3, 'errorStream', 'WARN: test\n'),
);
t.test(
  'when writing to channel 4',
  channelTest(4, 'errorStream', 'INFO: test\n'),
);
t.test(
  'when writing to channel 5',
  channelTest(5, 'errorStream', 'DEBUG: test\n'),
);
