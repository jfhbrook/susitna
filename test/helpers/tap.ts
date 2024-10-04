import { expect } from 'vitest';

import { expectSnapshotWithStack } from './stack';

//
// Some tests are running with vitest, but are still using node-tap assert
// APIs. This is especially true for test helpers which take a tap.Test object
// as an argument.
//
// This object implements an API similar enough to tap.Test that it can be
// imported and used in vitest tests which would otherwise need to be ported
// to expect APIs.
//
// It can also be passed in place of a tap.Test in helpers, though in those
// cases, those helpers should define their own interface that overlaps with
// both tap.Test and this object, in order to avoid tap tests importing
// vitest.
//
export const test = {
  ok(o: any): void {
    expect(o).toBeTruthy();
  },

  equal(actual: any, expected: any, message?: string): void {
    expect(actual, message).toBe(expected);
  },

  same(actual: any, expected: any, message?: string): void {
    expect(actual, message).toEqual(expected);
  },

  rejects(fn: () => any, errType: any, message?: string): void {
    expect(fn(), message).rejects.toBeInstanceOf(errType);
  },

  match(actual: any, expected: any, message?: string): void {
    expect(actual, message).toMatch(expected);
  },

  throws(fn: () => any, err: any): any {
    expect(fn).toThrowError(err);
  },

  matchSnapshot(actual: any): void {
    if (typeof actual === 'string') {
      expectSnapshotWithStack(actual);
      return;
    }
    expect(actual).toMatchSnapshot();
  },
};

export type Test = typeof test;

export const t = test;
