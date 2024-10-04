import { expect } from 'vitest';

import { formatter } from '../../format';

import { expectSnapshotWithStack } from './stack';

export async function throws(fn: () => any) {
  let error: any = null;
  try {
    await fn();
  } catch (err) {
    error = err;
  }
  expect(error).toBeTruthy();
  expectSnapshotWithStack(formatter.format(error));
}
