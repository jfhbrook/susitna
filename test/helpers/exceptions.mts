import { Test } from 'tap';

import { formatter } from '../../format.mjs';

export async function throws(t: Test, fn: () => any) {
  let error: any = null;
  try {
    await fn();
  } catch (err) {
    error = err;
  }
  t.ok(error);
  t.matchSnapshot(formatter.format(error));
}
