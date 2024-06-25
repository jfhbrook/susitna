import t from 'tap';

import { BaseException } from '../../exceptions';

import { Value, nil } from '../../value';
import { Type } from '../../value/types';
import { typeOf } from '../../value/typeof';

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

for (const [value, type] of CASES) {
  t.equal(typeOf(value as Value), type, `${value} -> ${type}`);
}
