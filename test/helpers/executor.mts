import { Test as Testing } from '@nestjs/testing';
import { discuss } from '@jfhbrook/swears';

import { Config } from '../../config.mjs';
import { Editor } from '../../editor.mjs';
import { Executor } from '../../executor.mjs';

import { CONFIG } from './config.mjs';
import { MockConsoleHost } from './host.mjs';

class MockExecutor extends Executor {}

export const executorTopic = discuss(
  async () => {
    const host = new MockConsoleHost();
    const deps = await Testing.createTestingModule({
      providers: [
        {
          provide: 'Host',
          useValue: host,
        },
        {
          provide: Config,
          useValue: CONFIG,
        },
        Editor,
        {
          provide: Executor,
          useClass: MockExecutor,
        },
      ],
    }).compile();
    const editor = deps.get(Editor);
    const executor = deps.get(Executor);

    await executor.init();

    return {
      host,
      editor,
      executor,
    };
  },
  async ({ executor }) => {
    await executor.close();
  },
);
