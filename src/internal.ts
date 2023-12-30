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
// length:
//
// [FieldLength, LineNo, ...Op | Value, FieldLength, LineNo, ...Op | Value, ...]
//
// Field length is the count of all Ops/Values plus the line number - it does
// not include the field length itself. For example:
//
// [5, 100, { value: 1}, {value: 1}, Op.PlusIntInt, Op.PrintInt, 5, 200, ...]
//
export type Lines = Array<FieldLength | LineNo | Op | Value>;

//
// Cursor! For iterating/seeking over the program!
//

// Cursors start at the first code. Therefore, the cursor starts at index 2:
//
//      (0)      v          (2)           (3)           (4)
// [5, 100, { value: 1}, {value: 1}, Op.PlusIntInt, Op.PrintInt, 5, 200, ...]
const OP_START = 2;

// Line number and field length are offset respectively:
const LINE_NO_OFFSET = -1;
const FIELD_LENGTH_OFFSET = -2;

// If you add field length to start, you'll get the index of the next line
// number - we need to apply offsets to that in order to get the end of the
// prior line and the start of the next line accordingly
//
//             start                                                 5
//               v          (1)           (2)           (3)     (4)  V
// [5, 100, { value: 1}, {value: 1}, Op.PlusIntInt, Op.PrintInt, 5, 200, ...]
const END_OFFSET = -1;
const START_OFFSET = 1;

export interface CursorOptions {
  start?: number | null;
}

export class Cursor {
  public start: number | null;

  constructor(private program: Program, options?: CursorOptions) {
    if (typeof options?.start !== 'undefined') {
      this.start = options.start;
    } else if (!this.program.lines.length) {
      // If the program is empty, there *isn't* a start position
      this.start = null;
    } else {
      this.start = OP_START;
    }
  }

  // If there's no meaningful start position, that means the cursor is
  // exhuasted - either the program starts empty or we've gone to the end.
  //
  // Note that, for type checking purposes, we internally check this.start
  // instead of exhuasted.
  get exhausted(): boolean {
    return this.start === null;
  }

  get lineNo(): LineNo | null {
    if (!this.start) {
      return null;
    }

    return this.program.lines[this.start + LINE_NO_OFFSET] as LineNo;
  }

  get end(): number | null {
    if (!this.start) {
      return null;
    }
    const fieldLength = this.program.lines[this.start + FIELD_LENGTH_OFFSET] as FieldLength;
    return this.start + fieldLength + END_OFFSET;
  }

  next(): void {
    if (!this.start) {
      return;
    }

    const fieldLength = this.program.lines[this.start + FIELD_LENGTH_OFFSET] as FieldLength | undefined;

    // If there's no field length, we've gone past the end of the array
    if (typeof fieldLength === 'undefined') {
      this.start = null;
      return;
    }
    this.start += fieldLength + START_OFFSET;
  }

  // Seek to the start of a given line. If a line doesn't exist, seek to the
  // *prior* line.
  seek(lineNo: LineNo): void {
    // Empty program? we're done.
    if (!this.start || !this.lineNo) {
      return;
    }

    // Are we there already?
    if (this.lineNo === lineNo) {
      return;
    }

    // We don't really have a way of seeking backwards, so if we overshoot
    // we *unfortunately* have to go back to the start. It's best to avoid
    // this, but it's supported.
    if (this.lineNo > lineNo) {
      this.start = 0;
    }

    // The start index of the previous line. The while loop should always
    // run once, so this will get initialized properly.
    let previous: number = -1;

    while (this.lineNo !== null && this.lineNo < lineNo) {
      previous = this.start;
      this.next();
    }

    // If we overshot, then we want the field seen previously
    if (this.start === null || this.lineNo > lineNo) {
      this.start = previous;
    }
  }

  clone(): Cursor {
    return new Cursor(this.program, { start: this.start });
  }
}

// a Program at its core is a collection of lines, but it will also be the
// owner of the environment - ie, variables. We'll define how that works
// later.
export class Program {
  public lines: Lines;

  constructor() {
    this.lines = [];
  }

  cursor(options?: CursorOptions): Cursor {
    return new Cursor(this, options);
  }
}

// TODO: I'd like to encode and test stack effects at some point
// Factor encodes stack effects like `(A B C -- D)`, and for now I'm clocking
// that here.
// export type Effect = Array<Value | "--">
