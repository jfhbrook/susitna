import { discuss } from '@jfhbrook/swears';

import { Config } from '../../config';
import { Commander } from '../../commander';
import { Level } from '../../host';
import { MockConsoleHost } from './host';

export const commanderTopic = discuss(
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
