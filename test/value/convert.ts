import t from 'tap';
import { Test } from 'tap';

import { BaseException, TypeError } from '../../exceptions';
import { BaseFault, NotImplementedFault, RuntimeFault } from '../../faults';
import { formatter } from '../../format';
import { nil, Value } from '../../value';
import { Type } from '../../value/types';
import { into, intoType } from '../../value/convert';

const EXCEPTION = new BaseException('test exception');

type TestCase = [Value, Type, Type, any];

const CASES: TestCase[] = [
  [123, Type.Integer, Type.Integer, 123],
  [123, Type.Integer, Type.Real, 123],
  [123, Type.Integer, Type.Boolean, true],
  [0, Type.Integer, Type.Boolean, false],
  [123, Type.Integer, Type.String, '123'],
  [123, Type.Integer, Type.Exception, TypeError],
  [123, Type.Integer, Type.Nil, TypeError],
  [123, Type.Integer, Type.Any, RuntimeFault],

  [123.456, Type.Real, Type.Integer, 123],
  [123.456, Type.Real, Type.Real, 123.456],
  [123.456, Type.Real, Type.Boolean, true],
  [0.0, Type.Real, Type.Boolean, false],
  [123.456, Type.Real, Type.String, '123.456'],
  [123.456, Type.Real, Type.Exception, TypeError],
  [123.456, Type.Real, Type.Nil, TypeError],
  [123.456, Type.Real, Type.Any, RuntimeFault],

  [true, Type.Boolean, Type.Integer, 1],
  [true, Type.Boolean, Type.Real, 1.0],
  [true, Type.Boolean, Type.Boolean, true],
  [true, Type.Boolean, Type.String, 'true'],
  [true, Type.Boolean, Type.Exception, TypeError],
  [true, Type.Boolean, Type.Nil, TypeError],
  [true, Type.Boolean, Type.Any, RuntimeFault],

  ['hello', Type.String, Type.Integer, NotImplementedFault],
  ['123', Type.String, Type.Integer, NotImplementedFault],
  ['hello', Type.String, Type.Real, NotImplementedFault],
  ['123.456', Type.String, Type.Real, NotImplementedFault],
  ['hello', Type.String, Type.Boolean, true],
  ['', Type.String, Type.Boolean, false],
  ['hello', Type.String, Type.String, 'hello'],
  ['hello', Type.String, Type.Exception, TypeError],
  ['hello', Type.String, Type.Nil, TypeError],
  ['hello', Type.String, Type.Any, RuntimeFault],

  [EXCEPTION, Type.Exception, Type.Integer, TypeError],
  [EXCEPTION, Type.Exception, Type.Real, TypeError],
  [EXCEPTION, Type.Exception, Type.Boolean, true],
  [EXCEPTION, Type.Exception, Type.String, formatter.format(EXCEPTION)],
  [EXCEPTION, Type.Exception, Type.Exception, EXCEPTION],
  [EXCEPTION, Type.Exception, Type.Nil, TypeError],
  [EXCEPTION, Type.Exception, Type.Any, RuntimeFault],

  [nil, Type.Nil, Type.Integer, 0],
  [nil, Type.Nil, Type.Real, 0.0],
  [nil, Type.Nil, Type.Boolean, false],
  [nil, Type.Nil, Type.String, 'nil'],
  [nil, Type.Nil, Type.Exception, TypeError],
  [nil, Type.Nil, Type.Nil, nil],
  [nil, Type.Nil, Type.Any, RuntimeFault],
];

function testInto(t: Test, [value, from_, to_, expected]: TestCase): void {
  const proto = (expected as any).prototype;
  const isError = proto instanceof BaseException || proto instanceof BaseFault;
  const isUnimplemented = isError
    ? proto.name === 'NotImplementedFault'
    : false;

  if (isError) {
    t.test(
      `into(${formatter.format(value)}, ${from_}, ${to_}) throws a ${proto.name}`,
      async (t: Test) => {
        t.throws(
          () => into(value, from_, to_),
          expected as BaseException | RuntimeFault,
        );
      },
    );
  } else {
    t.test(
      `into(${formatter.format(value)}, ${from_}, ${to_}) -> ${expected}`,
      async (t: Test) => {
        t.same(into(value, from_, to_), expected);
      },
    );
  }

  if (from_ === Type.Any || to_ === Type.Any) {
    t.test(`intoType(${from_}, ${to_}) -> any`, async (t: Test) => {
      t.equal(intoType(from_, to_), Type.Any);
    });
  } else if (isError && !isUnimplemented) {
    t.test(`intoType(${from_}, ${to_}) -> invalid`, async (t: Test) => {
      t.equal(intoType(from_, to_), Type.Invalid);
    });
  } else {
    t.test(`intoType(${from_}, ${to_}) -> ${to_}`, async (t: Test) => {
      t.equal(intoType(from_, to_), to_);
    });
  }
}

function testIntoFromAny(t: Test, [value, _, to_, expected]: TestCase): void {
  return testInto(t, [value, Type.Any, to_, expected]);
}

for (const case_ of CASES) {
  testInto(t, case_);
}

for (const case_ of CASES) {
  testIntoFromAny(t, case_);
}
