import t from 'tap';
import { Test } from 'tap';
import { discuss } from '@jfhbrook/swears';

import { Host } from '../host';
import { abbreviateHome, Prompt } from '../shell';

import { MockConsoleHost } from './helpers/host';

const hostTopic = discuss(async () => {
  return new MockConsoleHost();
});

const rootHostTopic = hostTopic.discuss<MockConsoleHost>(async (host) => {
  (host as any).uid = () => 0;
  return host;
});

async function renderer(host: Host) {
  return function renderPrompt(ps1: string): string {
    const prompt = new Prompt(ps1, 500, host);
    return prompt.render(0);
  };
}

const promptTopic = hostTopic.discuss(renderer);
const rootPromptTopic = rootHostTopic.discuss(renderer);

t.test('abbreviateHome', async (t: Test) => {
  await hostTopic.swear(async (host) => {
    t.test("when it's in the home directory", async (t: Test) => {
      t.equal(abbreviateHome('/home/josh/matanuska', host), '~/matanuska');
    });

    t.test('when it IS the home directory', async (t: Test) => {
      t.equal(abbreviateHome('/home/josh', host), '~');
    });

    t.test("when it's outside the home directory", async (t: Test) => {
      t.equal(abbreviateHome('/usr/share', host), '/usr/share');
    });
  });
});

t.test('renderPrompt', async (t: Test) => {
  await promptTopic.swear(async (renderPrompt) => {
    t.test('empty prompt', async (t: Test) => {
      t.equal(renderPrompt(''), '');
    });

    t.test('escape with no following', async (t: Test) => {
      t.equal(renderPrompt('\\'), '\\');
    });

    t.test('weekday month date', async (t: Test) => {
      t.equal(renderPrompt('\\d'), 'Sun Jun 23');
    });

    t.test('strftime format', async (t: Test) => {
      t.equal(renderPrompt('\\D{%o of %B}'), '23rd of June');
    });

    t.test('non-terminated strftime format', async (t: Test) => {
      t.equal(renderPrompt('\\D{%o of %B'), '23rd of June');
    });

    t.test('non-initialized strftime format', async (t: Test) => {
      t.equal(renderPrompt('\\D%o of %B'), '\\D%o of %B');
    });

    t.test('short hostname', async (t: Test) => {
      t.equal(renderPrompt('\\h'), 'gibson');
    });

    t.test('long hostname', async (t: Test) => {
      t.equal(renderPrompt('\\H'), 'gibson.local');
    });

    t.todo('jobs', async (t: Test) => {
      t.equal(renderPrompt('\\j'), '1');
    });

    t.test('tty', async (t: Test) => {
      t.equal(renderPrompt('\\l'), 'tty0');
    });

    t.test('shell', async (t: Test) => {
      t.equal(renderPrompt('\\s'), 'matbas');
    });

    t.test('24 hr HH:MM:SS', async (t: Test) => {
      t.equal(renderPrompt('\\t'), '13:00:00');
    });

    t.test('12 hr HH:MM:SS', async (t: Test) => {
      t.equal(renderPrompt('\\T'), '01:00:00');
    });

    t.test('12 hr AM/PM', async (t: Test) => {
      t.equal(renderPrompt('\\@'), '01:00 PM');
    });

    t.test('24 hr HH:MM', async (t: Test) => {
      t.equal(renderPrompt('\\A'), '13:00');
    });

    t.test('username', async (t: Test) => {
      t.equal(renderPrompt('\\u'), 'josh');
    });

    t.test('short version', async (t: Test) => {
      t.match(renderPrompt('\\v'), /^\d+\.\d+$/);
    });

    t.test('full version', async (t: Test) => {
      t.match(renderPrompt('\\V'), /^\d+\.\d+\.\d+$/);
    });

    t.test('pwd', async (t: Test) => {
      t.equal(renderPrompt('\\w'), '~/matanuska');
    });

    t.todo('history number', async (t: Test) => {
      t.equal(renderPrompt('\\!'), '1');
    });

    t.todo('command number', async (t: Test) => {
      t.equal(renderPrompt('\\#'), '1');
    });

    t.test('$ normally', async (t: Test) => {
      t.equal(renderPrompt('\\$'), '$');
    });

    t.test('$ for root', async (t: Test) => {
      await rootPromptTopic.swear(async (renderPrompt) => {
        t.equal(renderPrompt('\\$'), '#');
      });
    });

    t.test('plain octal ascii character', async (t: Test) => {
      t.equal(renderPrompt('\\141'), 'a');
    });

    // Google says this character is Korean. I picked it randomly
    // as something that was high enough to go beyond three digits, but
    // small enough to not trigger triple-byte unicode barfing
    // a la emojis.

    t.test('plain octal high-point unicode character', async (t: Test) => {
      t.equal(renderPrompt('\\533161'), '뙱');
    });

    t.test(
      'octal high-point unicode character with trailing octal digits',
      async (t: Test) => {
        t.equal(renderPrompt('\\53316143'), '뙱43');
      },
    );

    t.test(
      'octal ascii character with trailing decimal digits',
      async (t: Test) => {
        t.equal(renderPrompt('\\14199'), 'a99');
      },
    );

    t.test('too short octal ascii character', async (t: Test) => {
      t.equal(renderPrompt('\\14'), '\\14');
    });

    t.test('cheeky little backslash', async (t: Test) => {
      t.equal(renderPrompt('\\\\'), '\\');
    });

    t.test('stop counting characters', async (t: Test) => {
      t.equal(renderPrompt('\\['), '');
    });

    t.test('start counting characters', async (t: Test) => {
      t.equal(renderPrompt('\\]'), '');
    });

    t.test('unknown escape code', async (t: Test) => {
      t.equal(renderPrompt('\\q'), '\\q');
    });
  });
});
