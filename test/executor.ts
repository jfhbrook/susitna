import t from 'tap';
import { Test } from 'tap';

import { executorTopic } from './helpers/executor';

const topic = executorTopic({});

t.todo('a meaningful executor test', async (t: Test) => {
  await topic.swear(async ({ executor, host }) => {
    t.ok(executor);
    t.ok(host);
  });
});
