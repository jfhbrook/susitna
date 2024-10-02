import { Value } from './index.mjs';
import { Type } from './types.mjs';
import { typeOf } from './typeof.mjs';
import { TypeError } from '../exceptions.mjs';
import { formatter } from '../format.mjs';

//
// Truthiness and falsiness. Falsiness can also be thought of as the "not"
// operation.
//

export function truthy(value: Value, type: Type = Type.Any): boolean {
  if (type === Type.Any) {
    type = typeOf(value);
  }

  switch (type) {
    case Type.Integer:
    case Type.Real:
      return value != 0;
    case Type.Boolean:
      return value as boolean;
    case Type.String:
      return (value as string).length > 0;
    case Type.Exception:
      return true;
    case Type.Nil:
      return false;
    default:
      throw new TypeError(
        `Cannot determine if ${formatter.format(value)} is truthy`,
        value,
        type,
        Type.Boolean,
      );
  }
}

export function falsey(value: Value, type: Type = Type.Any): boolean {
  if (type === Type.Any) {
    type = typeOf(value);
  }

  switch (type) {
    case Type.Integer:
    case Type.Real:
      return value === 0;
    case Type.Boolean:
      return !value;
    case Type.String:
      return !(value as string).length;
    case Type.Exception:
      return false;
    case Type.Nil:
      return true;
    default:
      throw new TypeError(
        `Cannot determine if ${formatter.format(value)} is truthy`,
        value,
        type,
        Type.Boolean,
      );
  }
}
