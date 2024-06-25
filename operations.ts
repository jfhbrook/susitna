import { Type } from './value';

/**
 * The expected return type of a typical binary math expression, given
 * its input types.
 *
 * @param a The type of the first argument.
 * @param b The type of the second argument.
 *
 * @returns The expected type of the operation.
 */
export function binaryMathReturnType(a: Type, b: Type): Type {
  // TODO: This is an extremely error-prone approach to this problem. Can
  // I simplify this logic to use wouldCast ?
  // - will cast from boolean to integer and from integer to real
  // - if any arguments are Any, the return type is Any
  // - if any arguments are other values, it fails - how to encode that?
  switch (a) {
    case Type.Integer:
      switch (b) {
        case Type.Integer:
          return Type.Integer;
        case Type.Real:
          return Type.Real;
        case Type.Boolean:
          return Type.Integer;
        case Type.String:
          return Type.Unknown;
        case Type.Exception:
          return Type.Unknown;
        case Type.Nil:
          return Type.Unknown;
        case Type.Any:
          return Type.Any;
      }
    case Type.Real:
      switch (b) {
        case Type.Integer:
          return Type.Integer;
        case Type.Real:
          return Type.Real;
        case Type.Boolean:
          return Type.Boolean;
        case Type.String:
          return Type.String;
        case Type.Exception:
          return Type.Exception;
        case Type.Nil:
          return Type.Nil;
        case Type.Any:
          return Type.Any;
      }
    case Type.Boolean:
      switch (b) {
        case Type.Integer:
          return Type.Integer;
        case Type.Real:
          return Type.Real;
        case Type.Boolean:
          return Type.Boolean;
        case Type.String:
          return Type.String;
        case Type.Exception:
          return Type.Exception;
        case Type.Nil:
          return Type.Nil;
        case Type.Any:
          return Type.Any;
      }
    case Type.String:
      switch (b) {
        case Type.Integer:
          return Type.Integer;
        case Type.Real:
          return Type.Real;
        case Type.Boolean:
          return Type.Boolean;
        case Type.String:
          return Type.String;
        case Type.Exception:
          return Type.Exception;
        case Type.Nil:
          return Type.Nil;
        case Type.Any:
          return Type.Any;
      }

    case Type.Exception:
      switch (b) {
        case Type.Integer:
          return Type.Integer;
        case Type.Real:
          return Type.Real;
        case Type.Boolean:
          return Type.Boolean;
        case Type.String:
          return Type.String;
        case Type.Exception:
          return Type.Exception;
        case Type.Nil:
          return Type.Nil;
        case Type.Any:
          return Type.Any;
      }

    case Type.Nil:
      switch (b) {
        case Type.Integer:
          return Type.Integer;
        case Type.Real:
          return Type.Real;
        case Type.Boolean:
          return Type.Boolean;
        case Type.String:
          return Type.String;
        case Type.Exception:
          return Type.Exception;
        case Type.Nil:
          return Type.Nil;
        case Type.Any:
          return Type.Any;
      }

    case Type.Any:
      switch (b) {
        case Type.Integer:
          return Type.Integer;
        case Type.Real:
          return Type.Real;
        case Type.Boolean:
          return Type.Boolean;
        case Type.String:
          return Type.String;
        case Type.Exception:
          return Type.Exception;
        case Type.Nil:
          return Type.Nil;
        case Type.Any:
          return Type.Any;
      }
  }
}
