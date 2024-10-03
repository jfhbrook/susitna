import t from 'tap';

import { TypeError, ZeroDivisionError } from '../exceptions';
import * as op from '../operations';
import { Value } from '../value';

type ErrorType = typeof TypeError | typeof ZeroDivisionError;
type BinaryTestCase = [string, Value, Value, Value | ErrorType];
type UnaryTestCase = [string, Value, Value | ErrorType];

const BINARY_CASES: BinaryTestCase[] = [
  ['add', true, true, 2],
  ['add', true, 1, 2],
  ['add', true, 1.0, 2.0],
  ['add', true, 'bar', TypeError],
  ['add', 1, true, 2],
  ['add', 1, 1, 2],
  ['add', 1, 1.0, 2.0],
  ['add', 1, 'bar', TypeError],
  ['add', 1.0, true, 2],
  ['add', 1.0, 1, 2],
  ['add', 1.0, 1.0, 2],
  ['add', 1.0, 'bar', TypeError],
  ['add', 'foo', true, TypeError],
  ['add', 'foo', 1, TypeError],
  ['add', 'foo', 1.0, TypeError],
  ['add', 'foo', 'bar', 'foobar'],

  ['sub', true, true, 0],
  ['sub', 1, 1, 0],
  ['sub', 1.0, 1.0, 0.0],
  ['sub', 'foo', 'bar', TypeError],

  ['mul', true, true, 1],
  ['mul', 2, 2, 4],
  ['mul', 2.0, 2.0, 4.0],
  ['mul', 'foo', 'bar', TypeError],

  ['div', true, true, 1],
  ['div', 1, 1, 1],
  ['div', 1, 2, 0.5],
  ['div', 1.0, 1.0, 1.0],
  ['div', 'foo', 'bar', TypeError],

  ['div', true, false, ZeroDivisionError],
  ['div', 1, 0, ZeroDivisionError],
  ['div', 1.0, 0.0, ZeroDivisionError],
  ['div', 'foo', 'bar', TypeError],

  ['eq', true, true, true],
  ['eq', 2, 2, true],
  ['eq', 2.0, 2.0, true],
  ['eq', 'foo', 'foo', true],

  ['eq', true, false, false],
  ['eq', 2, 1, false],
  ['eq', 2.0, 1.0, false],
  ['eq', 'foo', 'bar', false],

  ['eq', true, 1.0, false],

  ['ne', true, true, false],
  ['ne', 2, 2, false],
  ['ne', 2.0, 2.0, false],
  ['ne', 'foo', 'foo', false],

  ['ne', true, false, true],
  ['ne', 2, 1, true],
  ['ne', 2.0, 1.0, true],
  ['ne', 'foo', 'bar', true],

  ['ne', true, 1.0, true],

  ['gt', true, true, false],
  ['gt', 2, 2, false],
  ['gt', 2.0, 2.0, false],
  ['gt', 'foo', 'foo', false],

  ['gt', true, false, true],
  ['gt', 2, 1, true],
  ['gt', 2.0, 1.0, true],
  ['gt', 'foo', 'bar', true],

  ['gt', false, true, false],
  ['gt', 1, 2, false],
  ['gt', 1.0, 2.0, false],
  ['gt', 'bar', 'foo', false],

  ['gt', true, 1.0, TypeError],

  ['ge', true, true, true],
  ['ge', 2, 2, true],
  ['ge', 2.0, 2.0, true],
  ['ge', 'foo', 'foo', true],

  ['ge', true, false, true],
  ['ge', 2, 1, true],
  ['ge', 2.0, 1.0, true],
  ['ge', 'foo', 'bar', true],

  ['ge', false, true, false],
  ['ge', 1, 2, false],
  ['ge', 1.0, 2.0, false],
  ['ge', 'bar', 'foo', false],

  ['ge', true, 1.0, TypeError],

  ['lt', true, true, false],
  ['lt', 2, 2, false],
  ['lt', 2.0, 2.0, false],
  ['lt', 'foo', 'foo', false],

  ['lt', true, false, false],
  ['lt', 2, 1, false],
  ['lt', 2.0, 1.0, false],
  ['lt', 'foo', 'bar', false],

  ['lt', false, true, true],
  ['lt', 1, 2, true],
  ['lt', 1.0, 2.0, true],
  ['lt', 'bar', 'foo', true],

  ['lt', true, 1.0, TypeError],

  ['le', true, true, true],
  ['le', 2, 2, true],
  ['le', 2.0, 2.0, true],
  ['le', 'foo', 'foo', true],

  ['le', true, false, false],
  ['le', 2, 1, false],
  ['le', 2.0, 1.0, false],
  ['le', 'foo', 'bar', false],

  ['le', false, true, true],
  ['le', 1, 2, true],
  ['le', 1.0, 2.0, true],
  ['le', 'bar', 'foo', true],

  ['le', true, 1.0, TypeError],
];

const UNARY_CASES: UnaryTestCase[] = [
  ['neg', true, -1],
  ['neg', 1, -1],
  ['neg', 1.0, -1.0],
  ['neg', 'foo', TypeError],

  ['not', true, false],
  ['not', 1, false],
  ['not', 1.0, false],
  ['not', 'foo', false],

  ['not', false, true],
  ['not', 0, true],
  ['not', 0.0, true],
  ['not', '', true],
];

for (const [method, a, b, expected] of BINARY_CASES) {
  if (expected === TypeError || expected === ZeroDivisionError) {
    t.throws(
      () => {
        op[method](a, b);
      },
      expected,
      `op.${method}(${a}, ${b})`,
    );
  } else {
    t.same(op[method](a, b), expected, `op.${method}(${a}, ${b})`);
  }
}

for (const [method, a, expected] of UNARY_CASES) {
  if (expected === TypeError || expected === ZeroDivisionError) {
    t.throws(
      () => {
        op[method](a);
      },
      expected,
      `op.${method}(${a})`,
    );
  } else {
    t.same(op[method](a), expected, `op.${method}(${a})`);
  }
}
