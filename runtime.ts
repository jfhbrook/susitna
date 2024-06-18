import { spanSync } from './trace';

import { NotImplementedError } from './exceptions';
import { Host } from './host';
import { Stack } from './stack';
import { Value, nil } from './value';

import { Chunk } from './bytecode/chunk';
import { OpCode } from './bytecode/opcodes';

export class Runtime {
  public stack: Stack;
  private pc: number = -1;
  private chunk: Chunk | null = null;

  constructor(private host: Host) {
    this.stack = new Stack();
  }

  interpret(chunk: Chunk): Value {
    this.chunk = chunk;
    this.pc = 0;
    return this.run();
  }

  // TODO: Using templates can help decrease boilerplate while increasing the
  // amount of inlining. But if I'm going down that road, I might want to
  // consider porting this to C++ anyway.

  // NOTE: I'm calling this readByte to be consistent with clox, but in truth
  // we're not reading bytes at all. See chunk.ts for more details.
  //
  // In the future, I might rename this.
  readByte(): OpCode {
    const code = this.chunk.code[this.pc];
    this.pc++;
    return code;
  }

  readConstant(): Value {
    return this.chunk.constants[this.readByte()];
  }

  run(): Value {
    return spanSync('run', () => {
      let a: any = null;
      let b: any = null;
      let rv: Value | null = null;

      while (true) {
        const instruction = this.readByte();

        switch (instruction) {
          case OpCode.Constant:
            this.stack.push(this.readConstant());
            break;
          case OpCode.Nil:
            this.stack.push(nil);
            break;
          case OpCode.True:
            this.stack.push(true);
            break;
          case OpCode.False:
            this.stack.push(false);
            break;
          case OpCode.Pop:
            this.stack.pop();
            break;
          //
          // TODO: These operators don't do any type checking right now. At a
          // minimum I need to check what the types of a/b are and switch
          // accordingly. But I may also want separate instructions for
          // different types. I may also want to have particular instructions
          // for type conversions.
          //
          // TODO: Define my own semantics for equality.
          //
          case OpCode.Eq:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a === b);
            break;
          case OpCode.Gt:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a > b);
            break;
          case OpCode.Ge:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a >= b);
            break;
          case OpCode.Lt:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a < b);
            break;
          case OpCode.Le:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a <= b);
            break;
          case OpCode.Ne:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a !== b);
            break;
          case OpCode.Not:
            a = this.stack.pop();
            this.stack.push(!a);
            break;
          case OpCode.Add:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a + b);
            break;
          case OpCode.Sub:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a - b);
            break;
          case OpCode.Mul:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a * b);
            break;
          case OpCode.Div:
            b = this.stack.pop();
            a = this.stack.pop();
            this.stack.push(a / b);
            break;
          case OpCode.Neg:
            a = this.stack.pop();
            this.stack.push(-a);
            break;
          case OpCode.Print:
            this.host.writeLine(this.stack.pop());
            break;
          case OpCode.Jump:
            this.notImplemented('Jump');
            break;
          case OpCode.JumpIfFalse:
            this.notImplemented('JumpIfFalse');
            break;
          case OpCode.Loop:
            this.notImplemented('Loop');
            break;
          case OpCode.Return:
            rv = this.stack.pop();
            // TODO: Clean up the current frame, and only return if we're
            // done with the main program.
            return rv;
        }
      }
    });
  }

  notImplemented(message: string): Value {
    throw new NotImplementedError(message, null);
  }
}
