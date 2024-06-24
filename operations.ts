import { Type, UNKNOWN } from './value';

/**
 * The expected return type of a typical binary math expression, given
 * its input types.
 *
 * @param a The type of the first argument.
 * @param b The type of the second argument.
 *
 * @returns The expected type of the operation.
 */
export function binaryMathReturnType(a: Type, b: Type): Type | typeof UNKNOWN {
  // TODO: This is an extremely error-prone approach to this problem.
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
          return UNKNOWN;
        case Type.Exception:
          return UNKNOWN;
        case Type.Nil:
          return UNKNOWN;
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
