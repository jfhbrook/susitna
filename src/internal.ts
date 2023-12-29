// Internal representation of code. It's intended to be amenable to a rewrite
// in a lower level language which can pack/unpack individual bytes, but
// allows for idiomatic javascript types.

export type FieldLength = number;
export type LineNo = number;

// javascript doesn't distinguish between these types, but a future
// implementation in rust or c++ should be able to. if nothing else, BASIC
// distinguishes between the two, so we can use these type aliases to clarify
// code's intent
export type Int = number;
export type Real = number;

// In a lower level language, inline strings would likely be encoded as a
// byte length plus encoded bytes. In our case, however, we just store the
// string directly.
export type String = string;

// javascript has references, not pointers. but we can use this type to
// show where a lower level implementation *would* use a pointer, and also
// capture the possibility of a "null pointer".
export type Pointer<T> = T | null;

// Certain values may be used as dictionary keys - typically strings or
// integer indexes. I don't have a particular type for them - interpreting
// the type will be delegated to the operator.

// If using a proper bytecode, operators would be represented as bytes, with
// operands using a special marker bit/byte. WIC&I uses 0x00 to 0x7F for
// bytecode and (0x80 | value) to store 7-bit operands. Following WIC&I's
// example, we track values using a small wrapper interface which simulates
// this marker bit.
//
// Note that we don't track the *type* of a value. This is because the
// operator assumes a value type. In a lower level representation, we could
// store 64 bits and cast them to an int, float or pointer based on the
// opcode.
//
// Following CI's example, I would probably use a bytecode for "the next
// bit of stuff is a constant" instead of using a marker bit. The idea is
// similar, just less frugal.

export interface Value {
  value: Int | Real | String | Pointer<any>;
}

export enum Op {
  PrintInt,
  PrintReal,
  PrintString
}

export type Code = Op | Value;

export function isOperator(code: Code): code is Op {
  return typeof code === 'number';
}

export function isValue(code: Code): code is Value {
  return typeof code !== 'number';
}

// An individual line starts with a LineNo and then a series of operations
// and/or values
export type Line = Array<LineNo | Op | Value>;

// Within a collection of lines, each record is prefixed by a field
// length.
export type Lines = Array<FieldLength | LineNo | Op | Value>;

// a Program at its core is a collection of lines, but it will also be the
// owner of the environment - ie, variables. We'll define how that works
// later.
export class Program {
  public lines: Lines;

  constructor() {
    this.lines = [];
  }
}

// TODO: I'd like to encode and test stack effects at some point
// Factor encodes stack effects like `(A B C -- D)`, and for now I'm clocking
// that here.
// export type Effect = Array<Value | "--">
