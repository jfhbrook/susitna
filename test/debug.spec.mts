import { test } from 'vitest';

import { MockTracer } from './helpers/debug.mjs';
import { expectSnapshotWithStack } from './helpers/stack.mjs';

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

  expectSnapshotWithStack(TRACER.messages.join('\n'));
});
