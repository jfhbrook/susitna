import t from 'tap';
import { Test } from 'tap';

import { MockTracer } from './helpers/debug';

const TRACER = new MockTracer('main');

t.test('tracer', async (t: Test) => {
  TRACER.trace('before span');
  await TRACER.span('span', async () => {
    TRACER.trace('inside span');
  });
  TRACER.trace('after span');
  TRACER.spanSync('sync span', () => {
    TRACER.trace('inside sync span');
  });
  TRACER.trace('after sync span');

  t.matchSnapshot(TRACER.messages);
});
