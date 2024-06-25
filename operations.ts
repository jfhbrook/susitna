import { errorType } from './errors';
import { TypeError, ZeroDivisionError } from './exceptions';
import { Value } from './value';
import { Type } from './value/types';
import { typeOf } from './value/typeof';
import { cast } from './value/cast';
import { falsey } from './value/truthiness';

// TODO: I stumbled on a really nasty circular import bug. I was originally
// importing and re-exporting everything I'm importing here in value's index.
// When I did that, I triggered the circular import bug.
//
// Importing the libraries directly seems to avoid it, and I've moved towards
// using that pattern more generally. But I suspect that with the wrong
// imports in any file, I could trigger the issue once again.

function typePrecedence(type: Type): number {
  switch (type) {
    case Type.Boolean:
      return 0;
    case Type.Integer:
      return 1;
    case Type.Real:
      return 2;
    case Type.String:
      return 3;
    default:
      return 4;
  }
}

export function highestTypePrecedence(a: Type, b: Type): Type {
  if (typePrecedence(a) > typePrecedence(b)) {
    return a;
  }
  return b;
}

@errorType('Invalid')
class Invalid extends Error {
  constructor() {
    super('Invalid');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function invalid(): never {
  throw new Invalid();
}

type BinaryOperator = {
  name: string;
  check?: (
    aOriginal: Value,
    aType: Type,
    aCast: Value,
    bOriginal: Value,
    bType: Type,
    bCast: Value,
    tCast: Type,
  ) => void;
  boolean: (a: boolean, b: boolean) => Value;
  integer: (a: number, b: number) => Value;
  real: (a: number, b: number) => Value;
  string: (a: string, b: string) => Value;
};

export type BinaryOperation = (a: Value, b: Value) => Value;

export function binaryOperation(op: BinaryOperator): BinaryOperation {
  return function operation(a: Value, b: Value): Value {
    const typeA = typeOf(a);
    const typeB = typeOf(b);
    const castTo = highestTypePrecedence(typeA, typeB);

    let castA: any;
    let castB: any;
    let method: string;

    try {
      switch (castTo) {
        case Type.Boolean:
          (castA = cast(a, typeA, Type.Boolean)),
            (castB = cast(b, typeB, Type.Boolean)),
            (method = 'boolean');
          break;
        case Type.Integer:
          (castA = cast(a, typeA, Type.Integer)),
            (castB = cast(b, typeB, Type.Integer)),
            (method = 'integer');
          break;
        case Type.Real:
          castA = cast(a, typeA, Type.Real);
          castB = cast(b, typeB, Type.Real);
          method = 'real';
          break;
        case Type.String:
          (castA = cast(a, typeA, Type.String)),
            (castB = cast(b, typeB, Type.String)),
            (method = 'string');
          break;
        default:
          invalid();
      }

      if (op.check) {
        op.check(a, typeA, castA, b, typeB, castB, castTo);
      }

      return op[method](castA, castB);
    } catch (err) {
      if (err instanceof Invalid) {
        throw new TypeError(
          `Invalid operand for ${op.name} on ${typeA}: ${typeB}`,
          b,
          typeB,
          Type.Invalid,
        );
      }
      throw err;
    }
  };
}

type UnaryOperator = {
  name: string;
  boolean: (a: boolean) => Value;
  integer: (a: number) => Value;
  real: (a: number) => Value;
  string: (a: string) => Value;
};

export type UnaryOperation = (a: Value) => Value;

export function unaryOperation(op: UnaryOperator): UnaryOperation {
  return function operation(a: Value): Value {
    const type = typeOf(a);

    try {
      switch (type) {
        case Type.Boolean:
          return op.boolean(a as boolean);
        case Type.Integer:
          return op.integer(a as number);
        case Type.Real:
          return op.real(a as number);
        case Type.String:
          return op.string(a as string);
        default:
          invalid();
      }
    } catch (err) {
      if (err instanceof Invalid) {
        throw new TypeError(
          `Invalid operand for ${op.name}: ${type}`,
          a,
          type,
          Type.Invalid,
        );
      }
      throw err;
    }
  };
}

type ComparisonOperator = {
  name: string;
  any: (a: Value, aT: Type, b: Value, bT: Type) => boolean;
  boolean: (a: boolean, b: boolean) => boolean;
  integer: (a: number, b: number) => boolean;
  real: (a: number, b: number) => boolean;
  string: (a: string, b: string) => boolean;
};

export type ComparisonOperation = (a: Value, b: Value) => boolean;

export function comparisonOperation(
  op: ComparisonOperator,
): ComparisonOperation {
  return function operation(a: Value, b: Value): boolean {
    const typeA = typeOf(a);
    const typeB = typeOf(b);

    try {
      if (typeA != typeB) {
        return op.any(a, typeA, b, typeB);
      }

      switch (typeA) {
        case Type.Boolean:
          return op.boolean(a as boolean, b as boolean);
        case Type.Integer:
          return op.integer(a as number, b as number);
        case Type.Real:
          return op.real(a as number, b as number);
        case Type.String:
          return op.string(a as string, b as string);
        default:
          invalid();
      }
    } catch (err) {
      if (err instanceof Invalid) {
        throw new TypeError(
          `Invalid operand for ${op.name} on ${typeA}: ${typeB}`,
          b,
          typeB,
          Type.Invalid,
        );
      }
      throw err;
    }
  };
}

//
// Math operators
//

export const add = binaryOperation({
  name: '+',
  boolean: (a, b) => (a ? (b ? 2 : 1) : b ? 1 : 0),
  integer: (a, b) => a + b,
  real: (a, b) => a + b,
  string: (a, b) => a + b,
});

export const sub = binaryOperation({
  name: '-',
  boolean: (a, b) => {
    if (a) {
      return b ? 0 : 1;
    } else {
      return b ? -1 : 0;
    }
  },
  integer: (a, b) => a - b,
  real: (a, b) => a - b,
  string: (_a, _b) => invalid(),
});

export const mul = binaryOperation({
  name: '*',
  boolean: (a, b) => a && b,
  integer: (a, b) => a * b,
  real: (a, b) => a * b,
  string: (_a, _b) => invalid(),
});

export const div = binaryOperation({
  name: '/',
  check: (aOriginal, aType, _aCast, bOriginal, bType, bCast, _castTo) => {
    // Divide by zero check. In this case we don't need to switch on type,
    // because JavaScript will do the right thing for any numbers, and strings
    // are invalid anyway.
    if (!bCast) {
      throw new ZeroDivisionError(aOriginal, aType, bOriginal, bType);
    }
  },
  boolean: (a, _b) => (a ? 1 : 0),
  integer: (a, b) => a / b,
  real: (a, b) => a / b,
  string: (_a, _b) => invalid(),
});

export const neg = unaryOperation({
  name: '-',
  boolean: (a) => (a ? -1 : 0),
  integer: (a) => -a,
  real: (a) => -a,
  string: (_a) => invalid(),
});

//
// Comparison operators
//

export const eq = comparisonOperation({
  name: '==',
  any: (_a, _aT, _b, _bT) => false,
  boolean: (a, b) => a === b,
  integer: (a, b) => a === b,
  real: (a, b) => a === b,
  string: (a, b) => a === b,
});

export const ne = comparisonOperation({
  name: '<>',
  any: (_a, _aT, _b, _bT) => true,
  boolean: (a, b) => a !== b,
  integer: (a, b) => a !== b,
  real: (a, b) => a !== b,
  string: (a, b) => a !== b,
});

export const gt = comparisonOperation({
  name: '>',
  any: (_a, _aT, _b, _bT) => invalid(),
  boolean: (a, b) => a > b,
  integer: (a, b) => a > b,
  real: (a, b) => a > b,
  string: (a, b) => a > b,
});

export const ge = comparisonOperation({
  name: '>=',
  any: (_a, _aT, _b, _bT) => invalid(),
  boolean: (a, b) => a >= b,
  integer: (a, b) => a >= b,
  real: (a, b) => a >= b,
  string: (a, b) => a >= b,
});

export const lt = comparisonOperation({
  name: '<',
  any: (_a, _aT, _b, _bT) => invalid(),
  boolean: (a, b) => a < b,
  integer: (a, b) => a < b,
  real: (a, b) => a < b,
  string: (a, b) => a < b,
});

export const le = comparisonOperation({
  name: '<=',
  any: (_a, _aT, _b, _bT) => invalid(),
  boolean: (a, b) => a <= b,
  integer: (a, b) => a <= b,
  real: (a, b) => a <= b,
  string: (a, b) => a <= b,
});

//
// Logic operations. And and Or are implemented in bytecode using a combination
// of Jump and JumpIfFalse. That leaves Not. Not is equivalent to falsey,
// but is wrapped to provide a better error.
//

export function not(a: Value): boolean {
  const type = typeOf(a);
  try {
    return falsey(a, type);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new TypeError(
        `Invalid operand for not: ${type}`,
        a,
        type,
        Type.Invalid,
      );
    }
    throw err;
  }
}
