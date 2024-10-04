import { expect, test } from 'vitest';

import { MockTracer } from './helpers/debug';

const TRACER = new MockTracer('main');

test('tracer', async () => {
  TRACER.trace('before span');
  await TRACER.span('span', async () => {
    TRACER.trace('inside span');
  });
  TRACER.trace('after span');
  TRACER.spanSync('sync span', () => {
    TRACER.trace('inside sync span');
  });
  TRACER.trace('after sync span');

  expect(TRACER.messages).toMatchSnapshot();
});
