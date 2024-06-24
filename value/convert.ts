import { Nil, Value } from './value';
import { Type, UNKNOWN } from './types';
import { BaseException, TypeError } from '../exceptions';
import { NotImplementedFault, RuntimeFault } from '../faults';
import { formatter } from '../format';

//
// Type conversion. Be prepared for massive function signature overloads!
//
// Type conversion is very similar to casting. However, it's much more
// flexible and forgiving. For example, the number `123` can't be cast to
// a string, but *can* be converted into `"123"`.
//
// TODO: Should I simply implement separate functions for each conversion
// instead of switching on a Type enum each time? I like this API but it's
// doing a runtime check I can technically avoid.
//

function conversionError(value: Value, from_: string, to_: string): never {
  throw new TypeError(`Cannot convert ${from_} into ${to_}`, value, from_, to_);
}

function conversionFault(value: Value, from_: string, to_: string): never {
  try {
    conversionError(value, from_, to_);
  } catch (err) {
    throw new RuntimeFault(`Cannot convert ${from_} into ${to_}`, err);
  }
}

function fromInteger(value: number, to_: Type.Integer): number;
function fromInteger(value: number, to_: Type.Real): number;
function fromInteger(value: number, to_: Type.Boolean): boolean;
function fromInteger(value: number, to_: Type.String): string;
function fromInteger(value: number, to_: Type.Exception): never;
function fromInteger(value: number, to_: Type.Nil): never;
function fromInteger(value: number, to_: Type): never;
function fromInteger(value: number, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return value;
    case Type.Real:
      return value;
    case Type.Boolean:
      return !!value;
    case Type.String:
      return String(value);
    case Type.Exception:
      return conversionError(value, Type.Integer, Type.Exception);
    case Type.Nil:
      return conversionError(value, Type.Integer, Type.Nil);
  }

  return conversionFault(value, Type.Integer, UNKNOWN);
}

function fromReal(value: number, to_: Type.Integer): number;
function fromReal(value: number, to_: Type.Real): number;
function fromReal(value: number, to_: Type.Boolean): boolean;
function fromReal(value: number, to_: Type.String): string;
function fromReal(value: number, to_: Type.Exception): never;
function fromReal(value: number, to_: Type.Nil): never;
function fromReal(value: number, to_: Type): never;
function fromReal(value: number, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return Math.floor(value);
    case Type.Real:
      return value;
    case Type.Boolean:
      return !!value;
    case Type.String:
      return String(value);
    case Type.Exception:
      return conversionError(value, Type.Real, Type.Exception);
    case Type.Nil:
      return conversionError(value, Type.Real, Type.Nil);
  }

  return conversionFault(value, Type.Real, UNKNOWN);
}

function fromBoolean(value: boolean, to_: Type.Integer): number;
function fromBoolean(value: boolean, to_: Type.Real): number;
function fromBoolean(value: boolean, to_: Type.Boolean): boolean;
function fromBoolean(value: boolean, to_: Type.String): string;
function fromBoolean(value: boolean, to_: Type.Exception): boolean;
function fromBoolean(value: boolean, to_: Type.Nil): never;
function fromBoolean(value: boolean, to_: Type): never;
function fromBoolean(value: boolean, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return 1;
    case Type.Real:
      return 1.0;
    case Type.Boolean:
      return value;
    case Type.String:
      return value ? 'true' : 'false';
    case Type.Exception:
      return conversionError(value, Type.Boolean, Type.Exception);
    case Type.Nil:
      return conversionError(value, Type.Boolean, Type.Nil);
  }

  return conversionFault(value, Type.Boolean, UNKNOWN);
}

function fromString(value: string, to_: Type.Integer): string;
function fromString(value: string, to_: Type.Real): never;
function fromString(value: string, to_: Type.Boolean): boolean;
function fromString(value: string, to_: Type.String): string;
function fromString(value: string, to_: Type.Exception): never;
function fromString(value: string, to_: Type.Nil): never;
function fromString(value: string, to_: Type): never;
function fromString(value: string, to_: Type): Value {
  switch (to_) {
    // TODO: Move the decimal parser out of the scanner and use it here
    case Type.Integer:
      throw new NotImplementedFault('parseInt');
    case Type.Real:
      throw new NotImplementedFault('parseReal');
    case Type.Boolean:
      return !!value.length;
    case Type.String:
      return value;
    case Type.Exception:
      return conversionError(value, Type.String, Type.Exception);
    case Type.Nil:
      return conversionError(value, Type.String, Type.Nil);
  }

  return conversionFault(value, Type.String, UNKNOWN);
}

function fromException(value: BaseException, to_: Type.Integer): never;
function fromException(value: BaseException, to_: Type.Real): never;
function fromException(value: BaseException, to_: Type.Boolean): boolean;
function fromException(value: BaseException, to_: Type.String): never;
function fromException(
  value: BaseException,
  to_: Type.Exception,
): BaseException;
function fromException(value: BaseException, to_: Type.Nil): never;
function fromException(value: BaseException, to_: Type): never;
function fromException(value: BaseException, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return conversionError(value, Type.Exception, Type.Integer);
    case Type.Real:
      return conversionError(value, Type.Exception, Type.Real);
    case Type.Boolean:
      return true;
    case Type.String:
      return formatter.format(value);
    case Type.Exception:
      return value;
    case Type.Nil:
      return conversionError(value, Type.Exception, Type.Nil);
  }

  return conversionFault(value, Type.Exception, UNKNOWN);
}

function fromNil(value: Nil, to_: Type.Integer): never;
function fromNil(value: Nil, to_: Type.Real): never;
function fromNil(value: Nil, to_: Type.Boolean): boolean;
function fromNil(value: Nil, to_: Type.String): never;
function fromNil(value: Nil, to_: Type.Exception): never;
function fromNil(value: Nil, to_: Type.Nil): Nil;
function fromNil(value: Nil, to_: Type): Value;
function fromNil(value: Nil, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return 0;
    case Type.Real:
      return 0;
    case Type.Boolean:
      return false;
    case Type.String:
      return 'nil';
    case Type.Exception:
      return conversionError(value, Type.Nil, Type.Exception);
    case Type.Nil:
      return value;
  }

  return conversionFault(value, Type.Nil, UNKNOWN);
}

function fromAny(value: Value, to_: Type.Integer): number;
function fromAny(value: Value, to_: Type.Real): number;
function fromAny(value: Value, to_: Type.Boolean): boolean;
function fromAny(value: Value, to_: Type.String): string;
function fromAny(value: Value, to_: Type.Exception): BaseException;
function fromAny(value: Value, to_: Type.Nil): Nil;
function fromAny(value: Value, to_: Type): never;
function fromAny(value: Value, to_: Type): Value {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return fromInteger(value, to_);
    }
    return fromReal(value, to_);
  }
  if (typeof value === 'boolean') {
    return fromBoolean(value, to_);
  }
  if (typeof value === 'string') {
    return fromString(value, to_);
  }
  if (value instanceof BaseException) {
    return fromException(value, to_);
  }
  if (value instanceof Nil) {
    return fromNil(value, to_);
  }
  return conversionFault(value, Type.Any, UNKNOWN);
}

function into(value: Value, from_: Type.Integer, to_: Type.Integer): number;
function into(value: Value, from_: Type.Integer, to_: Type.Real): number;
function into(value: Value, from_: Type.Integer, to_: Type.Boolean): boolean;
function into(value: Value, from_: Type.Integer, to_: Type.String): string;
function into(
  value: Value,
  from_: Type.Integer,
  to_: Type.Exception,
): BaseException;
function into(value: Value, from_: Type.Real, to_: Type.Integer): number;
function into(value: Value, from_: Type.Real, to_: Type.Real): number;
function into(value: Value, from_: Type.Real, to_: Type.Boolean): boolean;
function into(value: Value, from_: Type.Real, to_: Type.String): string;
function into(
  value: Value,
  from_: Type.Real,
  to_: Type.Exception,
): BaseException;
function into(value: Value, from_: Type.Boolean, to_: Type.Integer): number;
function into(value: Value, from_: Type.Boolean, to_: Type.Real): number;
function into(value: Value, from_: Type.Boolean, to_: Type.Boolean): boolean;
function into(value: Value, from_: Type.Boolean, to_: Type.String): string;
function into(
  value: Value,
  from_: Type.Boolean,
  to_: Type.Exception,
): BaseException;
function into(value: Value, from_: Type.String, to_: Type.Integer): number;
function into(value: Value, from_: Type.String, to_: Type.Real): number;
function into(value: Value, from_: Type.String, to_: Type.Boolean): boolean;
function into(value: Value, from_: Type.String, to_: Type.String): string;
function into(
  value: Value,
  from_: Type.String,
  to_: Type.Exception,
): BaseException;
function into(value: Value, from_: Type.Exception, to_: Type.Integer): number;
function into(value: Value, from_: Type.Exception, to_: Type.Real): number;
function into(value: Value, from_: Type.Exception, to_: Type.Boolean): boolean;
function into(value: Value, from_: Type.Exception, to_: Type.String): string;
function into(
  value: Value,
  from_: Type.Exception,
  to_: Type.Exception,
): BaseException;
function into(value: Value, from_: Type.Nil, to_: Type.Integer): number;
function into(value: Value, from_: Type.Nil, to_: Type.Real): number;
function into(value: Value, from_: Type.Nil, to_: Type.Boolean): boolean;
function into(value: Value, from_: Type.Nil, to_: Type.String): string;
function into(
  value: Value,
  from_: Type.Nil,
  to_: Type.Exception,
): BaseException;
function into(value: Value, from_: Type.Any, to_: Type.Integer): number;
function into(value: Value, from_: Type.Any, to_: Type.Real): number;
function into(value: Value, from_: Type.Any, to_: Type.Boolean): boolean;
function into(value: Value, from_: Type.Any, to_: Type.String): string;
function into(
  value: Value,
  from_: Type.Any,
  to_: Type.Exception,
): BaseException;
function into(value: Value, from_: Type, to_: Type): never;
function into(value: Value, from_: Type, to_: Type): Value {
  switch (from_) {
    case Type.Integer:
      return fromInteger(value as number, to_);
    case Type.Real:
      return fromReal(value as number, to_);
    case Type.Boolean:
      return fromBoolean(value as boolean, to_);
    case Type.String:
      return fromString(value as string, to_);
    case Type.Exception:
      return fromException(value as BaseException, to_);
    case Type.Nil:
      return fromNil(value as Nil, to_);
    case Type.Any:
      return fromAny(value as Value, to_);
    default:
      return conversionFault(value, UNKNOWN, UNKNOWN);
  }
}

export { into };
