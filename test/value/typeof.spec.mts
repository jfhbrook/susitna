import { describe, expect, test } from 'vitest';

import { BaseException } from '../../exceptions.mjs';

import { Value, nil } from '../../value/index.mjs';
import { Type } from '../../value/types.mjs';
import { typeOf } from '../../value/typeof.mjs';

const UNKNOWN = {};

type TestCase = [Value | typeof UNKNOWN, Type];

const CASES: TestCase[] = [
  [true, Type.Boolean],
  [123, Type.Integer],
  [123.456, Type.Real],
  ['hello', Type.String],
  [nil, Type.Nil],
  [new BaseException('test'), Type.Exception],
  [UNKNOWN, Type.Unknown],
];

describe('typeof', () => {
  for (const [value, type] of CASES) {
    test(`${value} -> ${type}`, () => {
      expect(typeOf(value as Value)).toBe(type);
    });
  }
});
