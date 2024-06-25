import t from 'tap';
import { Test } from 'tap';

import { BaseException } from '../../exceptions';

import { Value, nil } from '../../value';
import { Type } from '../../value/types';
import { typeOf } from '../../value/typeof';
import { truthy, falsey } from '../../value/truthiness';

type TestCase = [Value, boolean];

const CASES: TestCase[] = [
  [true, true],
  [false, false],
  [123, true],
  [0, false],
  [123.456, true],
  [0.0, false],
  ['hello', true],
  ['', false],
  [nil, false],
  [new BaseException('test'), true],
];

t.test('truthy', async (t: Test) => {
  await t.test('when the type is known', async (t: Test) => {
    for (const [value, isTruthy] of CASES) {
      const type = typeOf(value);
      t.equal(truthy(value, type), isTruthy, `${value} is truthy`);
    }
  });

  await t.test('when the type is unknown', async (t: Test) => {
    for (const [value, isTruthy] of CASES) {
      t.equal(truthy(value, Type.Any), isTruthy, `${value} is truthy`);
    }
  });
});

t.test('falsey', async (t: Test) => {
  await t.test('when the type is known', async (t: Test) => {
    for (const [value, isTruthy] of CASES) {
      const type = typeOf(value);
      t.equal(falsey(value, type), !isTruthy, `${value} is falsey`);
    }
  });

  await t.test('when the type is unknown', async (t: Test) => {
    for (const [value, isTruthy] of CASES) {
      t.equal(falsey(value, Type.Any), !isTruthy, `${value} is falsey`);
    }
  });
});
