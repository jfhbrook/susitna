import { BaseException, TypeError } from './exceptions';
import { RuntimeFault } from './faults';
import { Formattable, Formatter } from './format';

export class Nil implements Formattable {
  format(_formatter: Formatter): string {
    return 'nil';
  }
}

export const nil = new Nil();

export type Value = number | boolean | string | BaseException | Nil;

export enum Type {
  Integer,
  Real,
  Boolean,
  String,
  Exception,
  Nil,
  Any,
}

//
// Type casting. Be prepared for massive function signature overloads!
//
// TODO: Should I simply implement separate functions for each cast instead
// of switching on a Type enum each time? I like this API but it's doing a
// runtime check I can technically avoid.
//

// TODO: TypeError should carry value and types
function castError(_value: Value, from_: string, to_: string): never {
  throw new TypeError(`Cannot cast ${from_} to ${to_}`);
}

function castFault(value: Value, from_: string, to_: string): never {
  try {
    castError(value, from_, to_);
  } catch (err) {
    throw new RuntimeFault(`Cannot cast ${from_} to ${to_}`, err);
  }
}

function castInteger(value: number, to_: Type.Integer): number;
function castInteger(value: number, to_: Type.Real): number;
function castInteger(value: number, to_: Type.Boolean): boolean;
function castInteger(value: number, to_: Type.String): string;
function castInteger(value: number, to_: Type.Exception): never;
function castInteger(value: number, to_: Type.Nil): never;
function castInteger(value: number, to_: Type): never;
function castInteger(value: number, to_: Type): Value {
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
      return castFault(value, 'integer', 'Exception');
    case Type.Nil:
      return castFault(value, 'integer', 'nil');
  }

  return castFault(value, 'integer', 'any');
}

function castReal(value: number, to_: Type.Integer): number;
function castReal(value: number, to_: Type.Real): number;
function castReal(value: number, to_: Type.Boolean): boolean;
function castReal(value: number, to_: Type.String): string;
function castReal(value: number, to_: Type.Exception): never;
function castReal(value: number, to_: Type.Nil): never;
function castReal(value: number, to_: Type): never;
function castReal(value: number, to_: Type): Value {
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
      return castFault(value, 'real', 'Exception');
    case Type.Nil:
      return castFault(value, 'real', 'nil');
  }

  return castFault(value, 'real', 'any');
}

function castBoolean(value: boolean, to_: Type.Integer): number;
function castBoolean(value: boolean, to_: Type.Real): number;
function castBoolean(value: boolean, to_: Type.Boolean): boolean;
function castBoolean(value: boolean, to_: Type.String): string;
function castBoolean(value: boolean, to_: Type.Exception): never;
function castBoolean(value: boolean, to_: Type.Nil): never;
function castBoolean(value: boolean, to_: Type): never;
function castBoolean(value: boolean, to_: Type): Value {
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
      return castFault(value, 'boolean', 'Exception');
    case Type.Nil:
      return castFault(value, 'boolean', 'nil');
  }

  return castFault(value, 'boolean', 'any');
}

function castString(value: string, to_: Type.Integer): never;
function castString(value: string, to_: Type.Real): number;
function castString(value: string, to_: Type.Boolean): boolean;
function castString(value: string, to_: Type.String): string;
function castString(value: string, to_: Type.Exception): never;
function castString(value: string, to_: Type.Nil): never;
function castString(value: string, to_: Type): never;
function castString(value: string, to_: Type): Value {
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
      return castFault(value, 'string', 'Exception');
    case Type.Nil:
      return castFault(value, 'string', 'nil');
  }

  return castFault(value, 'string', 'any');
}

function castException(value: BaseException, to_: Type.Integer): never;
function castException(value: BaseException, to_: Type.Real): never;
function castException(value: BaseException, to_: Type.Boolean): boolean;
function castException(value: BaseException, to_: Type.String): string;
function castException(
  value: BaseException,
  to_: Type.Exception,
): BaseException;
function castException(value: BaseException, to_: Type.Nil): never;
function castException(value: BaseException, to_: Type): never;
function castException(value: BaseException, to_: Type): Value {
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
      return value;
  }
}

function castNil(value: Nil, to_: Type.Integer): never;
function castNil(value: Nil, to_: Type.Real): never;
function castNil(value: Nil, to_: Type.Boolean): boolean;
function castNil(value: Nil, to_: Type.String): never;
function castNil(value: Nil, to_: Type.Exception): never;
function castNil(value: Nil, to_: Type.Nil): Nil;
function castNil(value: Nil, to_: Type): Value;
function castNil(value: Nil, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return castError(value, 'nil', 'integer');
    case Type.Real:
      return castError(value, 'nil', 'real');
    case Type.Boolean:
      return false;
    case Type.String:
      return castError(value, 'nil', 'string');
    case Type.Exception:
      return castError(value, 'nil', 'Exception');
    case Type.Nil:
      return value;
  }

  return castFault(value, 'nil', 'any');
}

function castAny(value: Value, to_: Type.Integer): number;
function castAny(value: Value, to_: Type.Real): number;
function castAny(value: Value, to_: Type.Boolean): boolean;
function castAny(value: Value, to_: Type.String): string;
function castAny(value: Value, to_: Type.Exception): BaseException;
function castAny(value: Value, to_: Type.Nil): Nil;
function castAny(value: Value, to_: Type): never;
function castAny(value: Value, to_: Type): Value {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return castInteger(value, to_);
    } else {
      return castReal(value, to_);
    }
  } else if (typeof value === 'boolean') {
    return castBoolean(value, to_);
  } else if (typeof value === 'string') {
    return castString(value, to_);
  } else if (value instanceof BaseException) {
    return castException(value, to_);
  } else if (value instanceof Nil) {
    return castNil(value, to_);
  } else {
    return castError(value, 'any', 'unknown');
  }
}

function cast(value: Value, from_: Type.Integer, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Integer, to_: Type.Real): number;
function cast(value: Value, from_: Type.Integer, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Integer, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Integer,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Real, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Real, to_: Type.Real): number;
function cast(value: Value, from_: Type.Real, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Real, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Real,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Boolean, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Boolean, to_: Type.Real): number;
function cast(value: Value, from_: Type.Boolean, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Boolean, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Boolean,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.String, to_: Type.Integer): number;
function cast(value: Value, from_: Type.String, to_: Type.Real): number;
function cast(value: Value, from_: Type.String, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.String, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.String,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Exception, to_: Type.Integer): never;
function cast(value: Value, from_: Type.Exception, to_: Type.Real): never;
function cast(value: Value, from_: Type.Exception, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Exception, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Exception,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Nil, to_: Type.Integer): never;
function cast(value: Value, from_: Type.Nil, to_: Type.Real): never;
function cast(value: Value, from_: Type.Nil, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Nil, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Nil,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Any, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Any, to_: Type.Real): number;
function cast(value: Value, from_: Type.Any, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Any, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Any,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type, to_: Type): never;
function cast(value: Value, from_: Type, to_: Type): Value {
  switch (from_) {
    case Type.Integer:
      return castInteger(value as number, to_);
    case Type.Real:
      return castReal(value as number, to_);
    case Type.Boolean:
      return castBoolean(value as boolean, to_);
    case Type.String:
      return castString(value as string, to_);
    case Type.Exception:
      return castException(value as BaseException, to_);
    case Type.Nil:
      return castNil(value as Nil, to_);
    case Type.Any:
      return castAny(value as Value, to_);
  }
}

export { cast };
