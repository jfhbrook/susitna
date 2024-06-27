import { discuss } from '@jfhbrook/swears';

import { container } from '../../container';
import { CONFIG } from './config';
import { MockConsoleHost } from './host';

export const executorTopic = discuss(
  async () => {
    const host = new MockConsoleHost();
    const deps = container(CONFIG, host);

    await deps.executor.init();

    return deps;
  },
  async ({ executor }) => {
    await executor.close();
  },
);
