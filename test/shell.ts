import t from 'tap';
import { Test } from 'tap';
import { discuss } from '@jfhbrook/swears';

import { abbreviateHome, renderPrompt } from '../shell';

import { MockConsoleHost } from './helpers/host';

const topic = discuss(async () => {
  return new MockConsoleHost();
});

t.test('abbreviateHome', async (t: Test) => {
  await topic.swear(async (host) => {
    t.test("when it's in the home directory", async (t: Test) => {
      t.equal(
        abbreviateHome('/Users/josh/Software/jfhbrook/matanuska', host),
        '~/Software/jfhbrook/matanuska',
      );
    });

    t.test('when it IS the home directory', async (t: Test) => {
      t.equal(abbreviateHome('/Users/josh', host), '~');
    });

    t.test("when it's outside the home directory", async (t: Test) => {
      t.equal(abbreviateHome('/usr/share', host), '/usr/share');
    });
  });
});

t.test('renderPrompt', async (t: Test) => {
  await topic.swear(async (host) => {
    t.test('bell character', async (t: Test) => {
      t.equal(renderPrompt('\\a', host), '\u0007');
    });

    t.test('weekday month date', async (t: Test) => {
      t.equal(renderPrompt('\\d', host), 'Sun Jun 23');
    });

    t.test('strftime format', async (t: Test) => {
      t.equal(renderPrompt('\\D{%o of %B}', host), '23rd of June');
    });

    t.test('non-terminated strftime format', async (t: Test) => {
      t.equal(renderPrompt('\\D{%o of %B', host), '23rd of June');
    });

    t.test('non-initialized strftime format', async (t: Test) => {
      t.equal(renderPrompt('\\D%o of %B', host), '\\D%o of %B');
    });

    t.test('escape character', async (t: Test) => {
      t.equal(renderPrompt('\\e', host), '\u001b');
    });

    t.test('short hostname', async (t: Test) => {
      t.equal(renderPrompt('\\h', host), 'gibson');
    });

    t.test('long hostname', async (t: Test) => {
      t.equal(renderPrompt('\\H', host), 'gibson.local');
    });

    t.skip('jobs', async (t: Test) => {
      t.equal(renderPrompt('\\j', host), '1');
    });

    t.test('tty', async (t: Test) => {
      t.equal(renderPrompt('\\l', host), 'tty0');
    });

    t.test('shell', async (t: Test) => {
      t.equal(renderPrompt('\\s', host), 'matbas');
    });

    t.test('24 hr HH:MM:SS', async (t: Test) => {
      t.equal(renderPrompt('\\t', host), '13:00:00');
    });

    t.test('12 hr HH:MM:SS', async (t: Test) => {
      t.equal(renderPrompt('\\T', host), '01:00:00');
    });

    t.test('12 hr AM/PM', async (t: Test) => {
      t.equal(renderPrompt('\\@', host), '01:00 PM');
    });

    t.test('24 hr HH:MM', async (t: Test) => {
      t.equal(renderPrompt('\\A', host), '13:00');
    });

    t.test('username', async (t: Test) => {
      t.equal(renderPrompt('\\u', host), 'josh');
    });

    t.test('short version', async (t: Test) => {
      t.match(renderPrompt('\\v', host), /^\d+\.\d+$/);
    });

    t.test('full version', async (t: Test) => {
      t.match(renderPrompt('\\V', host), /^\d+\.\d+\.\d+$/);
    });

    t.test('pwd', async (t: Test) => {
      t.equal(renderPrompt('\\w', host), '~/Software/jfhbrook/matanuska');
    });

    t.skip('history number', async (t: Test) => {
      t.equal(renderPrompt('\\!', host), '1');
    });

    t.skip('command number', async (t: Test) => {
      t.equal(renderPrompt('\\#', host), '1');
    });

    t.test('$ normally', async (t: Test) => {
      t.equal(renderPrompt('\\$', host), '$');
    });

    const rootTopic = topic.discuss<MockConsoleHost>(async (host) => {
      (host as any).uid = () => 0;
      return host;
    });

    t.test('$ for root', async (t: Test) => {
      await rootTopic.swear(async (host) => {
        t.equal(renderPrompt('\\$', host), '#');
      });
    });

    t.test('plain octal ascii character', async (t: Test) => {
      t.equal(renderPrompt('\\141', host), 'a');
    });

    // Google says this character is Korean. I picked it randomly
    // as something that was high enough to go beyond three digits, but
    // small enough to not trigger triple-byte unicode barfing
    // a la emojis.

    t.test('plain octal high-point unicode character', async (t: Test) => {
      t.equal(renderPrompt('\\533161', host), '뙱');
    });

    t.test(
      'octal high-point unicode character with trailing octal digits',
      async (t: Test) => {
        t.equal(renderPrompt('\\53316143', host), '뙱43');
      },
    );

    t.test(
      'octal ascii character with trailing decimal digits',
      async (t: Test) => {
        t.equal(renderPrompt('\\14199', host), 'a99');
      },
    );

    t.test('too short octal ascii character', async (t: Test) => {
      t.equal(renderPrompt('\\14', host), '\\14');
    });

    t.test('cheeky little backslash', async (t: Test) => {
      t.equal(renderPrompt('\\\\', host), '\\');
    });

    t.test('stop counting characters', async (t: Test) => {
      t.equal(renderPrompt('\\[', host), '');
    });

    t.test('start counting characters', async (t: Test) => {
      t.equal(renderPrompt('\\]', host), '');
    });

    t.test('unknown escape code', async (t: Test) => {
      t.equal(renderPrompt('\\q', host), '\\q');
    });
  });
});
