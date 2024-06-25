import { TypeError } from './exceptions';
import { RuntimeFault } from './faults';
import { Value, cast, Type, typeOf_ } from './value';

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

type Operator = {
  name: string;
  boolean: (a: boolean, b: boolean) => Value;
  integer: (a: number, b: number) => Value;
  real: (a: number, b: number) => Value;
  string: (a: string, b: string) => Value;
};

type Operation = (a: Value, b: Value) => Value;

function unreachable(name: string): never {
  throw new RuntimeFault(
    `Unreachable: ${name}`,
    new Error(`Unreachable: ${name}`),
  );
}

export function binaryMathOperation(op: Operator): Operation {
  return function operation(a: Value, b: Value): Value {
    console.log(typeOf_);
    const castTo = highestTypePrecedence(typeOf_(a), typeOf_(b));

    switch (castTo) {
      case Type.Boolean:
        return op.boolean(
          cast(a, Type.Any, Type.Boolean),
          cast(b, Type.Any, Type.Boolean),
        );
      case Type.Integer:
        return op.integer(
          cast(a, Type.Any, Type.Integer),
          cast(b, Type.Any, Type.Integer),
        );
      case Type.Real:
        return op.real(
          cast(a, Type.Any, Type.Real),
          cast(b, Type.Any, Type.Real),
        );
      case Type.String:
        return op.string(
          cast(a, Type.Any, Type.String),
          cast(b, Type.Any, Type.String),
        );
      default:
        throw new TypeError(
          `Invalid operand for ${op.name}: ${typeof b}`,
          b,
          typeOf_(b),
          Type.Invalid,
        );
    }
  };
}

export const add = binaryMathOperation({
  name: '+',
  boolean: (a, b) => a && b,
  integer: (a, b) => a + b,
  real: (a, b) => a + b,
  string: (a, b) => a + b,
});

export const sub = binaryMathOperation({
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
  string: (_a, _b) => unreachable('<str> - <str>'),
});

export const mul = binaryMathOperation({
  name: '*',
  boolean: (a, b) => a && b,
  integer: (a, b) => a * b,
  real: (a, b) => a * b,
  string: (_a, _b) => unreachable('<str> * <str>'),
});

// TODO: Error for divide by zero
export const div = binaryMathOperation({
  name: '/',
  boolean: (a, b) => (a ? 1 : 0) / (b ? 1 : 0),
  integer: (a, b) => a / b,
  real: (a, b) => a / b,
  string: (_a, _b) => unreachable('<str> / <str>'),
});
