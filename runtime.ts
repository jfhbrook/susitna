import { spanSync } from './trace';

import { NotImplementedError } from './exceptions';
import { Host } from './host';
import { Stack } from './stack';
import { Value, nil } from './value';

import { Chunk } from './bytecode/chunk';
import { OpCode } from './bytecode/opcodes';

export class Runtime {
  public stack: Stack;
  private lineNo: number = 0;
  private isLine: boolean = false;
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
          case OpCode.Eq:
            this.eq();
            break;
          case OpCode.Gt:
            this.gt();
            break;
          case OpCode.Ge:
            this.ge();
            break;
          case OpCode.Lt:
            this.lt();
            break;
          case OpCode.Le:
            this.le();
            break;
          case OpCode.Ne:
            this.ne();
            break;
          case OpCode.Not:
            this.not();
            break;
          case OpCode.Add:
            this.add();
            break;
          case OpCode.Sub:
            this.sub();
            break;
          case OpCode.Mul:
            this.mul();
            break;
          case OpCode.Div:
            this.div();
            break;
          case OpCode.Neg:
            this.neg();
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

  //
  // TODO: These don't do any type checking right now. At a minimum I need
  // to check what the types of a/b are and switch accordingly. But I may
  // also want separate instructions for different types. I may also want
  // to have particular instructions for type conversions.
  //
  // TODO: Define my own semantics for equality.
  //
  // TODO: Can/should I template this? It's a lot of boilerplate and clox
  // uses macros for binary operations. tslox uses mapping functions, but
  // ick.

  eq(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) === (b as any));
  }

  gt(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) > (b as any));
  }

  ge(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) >= (b as any));
  }

  lt(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) < (b as any));
  }

  le(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) <= (b as any));
  }

  ne(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) !== (b as any));
  }

  not(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) === (b as any));
  }

  add(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) + (b as any));
  }

  sub(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) - (b as any));
  }

  mul(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) * (b as any));
  }

  div(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) / (b as any));
  }

  neg(): void {
    const a = this.stack.pop();

    this.stack.push(-(a as any));
  }
}
