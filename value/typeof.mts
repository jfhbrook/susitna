import { BaseException } from '../exceptions.mjs';
import { Type } from './types.mjs';
import { Value, Nil } from './index.mjs';

export function typeOf(value: Value): Type {
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
