import { BaseException } from '../exceptions';
import { Value, Nil } from './value';
import { Type } from './types';

export { Nil, nil, Value } from './value';

export { Type } from './types';

export { cast, castType } from './cast';
export { into, intoType } from './convert';

export function typeOf_(value: Value): Type {
  const type = typeof value;
  if (type === 'boolean') {
    return Type.Boolean;
  }
  if (type === 'number') {
    if (Number.isInteger(value)) {
      return Type.Integer;
    }
    return Type.Real;
  }
  if (type === 'string') {
    return Type.String;
  }
  if (value instanceof Nil) {
    return Type.Nil;
  }
  if (value instanceof BaseException) {
    return Type.Exception;
  }
  return Type.Unknown;
}
