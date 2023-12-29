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

export type Value = Int | Real | string | Pointer<any>;

// If using a proper bytecode, operators would be represented as bytes, with
// operands using a special marker bit/byte. WIC&I uses 0x00 to 0x7F for
// bytecode and (0x80 | value) to store 7-bit operands. We would probably use
// a bytecode for "the next thing is a constant".
//
// Note that an operator's implementation is generally in charge of
// interpreting the type of an operand - this means that as long as ints,
// reals and pointers all use 64 bits, then we can treat those fields more
// or less agnostically up and until the operator indicates what the type
// is.
export enum Op {
  PrintInt,
  PrintReal,
  PrintString
}

export type Code = FieldLength | LineNo | Op | Value;

export interface Line {
  lineNo: LineNo;
  commands: Code[]
}

// a Program at its core is a collection of lines, but it will also be the
// owner of the environment - ie, variables. We'll define how that works
// later.
export class Program {
  public lines: Line[];

  constructor() {
    this.lines = [];
  }
}
