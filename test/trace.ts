import t from 'tap';
import { Test } from 'tap';

import { MockTracer } from './helpers/trace';

const TRACER = new MockTracer();

t.test('tracer', async (t: Test) => {
  TRACER.trace('before span');
  TRACER.open('span');
  TRACER.trace('inside span');
  TRACER.close();
  TRACER.trace('after span');

  t.matchSnapshot(TRACER.messages);
});
