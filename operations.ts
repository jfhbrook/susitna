import { errorType } from './errors';
import { TypeError } from './exceptions';
import { RuntimeFault } from './faults';
import { Value } from './value';
import { Type } from './value/types';
import { typeOf } from './value/typeof';
import { cast } from './value/cast';

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

function unreachable(name: string): never {
  throw new RuntimeFault(
    `Unreachable: ${name}`,
    new Error(`Unreachable: ${name}`),
  );
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
  boolean: (a: boolean, b: boolean) => Value;
  integer: (a: number, b: number) => Value;
  real: (a: number, b: number) => Value;
  string: (a: string, b: string) => Value;
};

type BinaryOperation = (a: Value, b: Value) => Value;

export function binaryOperation(op: BinaryOperator): BinaryOperation {
  return function operation(a: Value, b: Value): Value {
    const typeA = typeOf(a);
    const typeB = typeOf(b);
    const castTo = highestTypePrecedence(typeA, typeB);

    try {
      switch (castTo) {
        case Type.Boolean:
          return op.boolean(
            cast(a, typeA, Type.Boolean),
            cast(b, typeB, Type.Boolean),
          );
        case Type.Integer:
          return op.integer(
            cast(a, typeA, Type.Integer),
            cast(b, typeB, Type.Integer),
          );
        case Type.Real:
          return op.real(cast(a, typeA, Type.Real), cast(b, typeB, Type.Real));
        case Type.String:
          return op.string(
            cast(a, typeA, Type.String),
            cast(b, typeB, Type.String),
          );
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

type UnaryOperator = {
  name: string;
  boolean: (a: boolean) => Value;
  integer: (a: number) => Value;
  real: (a: number) => Value;
  string: (a: string) => Value;
};

type UnaryOperation = (a: Value) => Value;

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

export const add = binaryOperation({
  name: '+',
  boolean: (a, b) => a && b,
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

// TODO: Error for divide by zero
export const div = binaryOperation({
  name: '/',
  boolean: (a, b) => (a ? 1 : 0) / (b ? 1 : 0),
  integer: (a, b) => a / b,
  real: (a, b) => a / b,
  string: (_a, _b) => invalid(),
});

export const neg = unaryOperation({
  name: '/',
  boolean: (a) => (a ? -1 : 0),
  integer: (a) => -a,
  real: (a) => -a,
  string: (_a) => invalid(),
});
