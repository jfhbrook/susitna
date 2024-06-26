import { discuss } from '@jfhbrook/swears';

import { container } from '../../container';
import { CONFIG } from './config';
import { MockConsoleHost } from './host';

export const commanderTopic = discuss(
  async () => {
    const host = new MockConsoleHost();
    const deps = container(CONFIG, host);

    await deps.commander.init();

    return deps;
  },
  async ({ commander }) => {
    await commander.close();
  },
);
