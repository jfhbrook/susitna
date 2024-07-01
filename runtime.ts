import * as assert from 'assert';

import { startTraceExec, traceExec } from './debug';

import { BaseException, NameError, NotImplementedError } from './exceptions';
import { Exit } from './exit';
import { RuntimeFault } from './faults';
import { Host } from './host';
import { Stack } from './stack';
import { Traceback } from './traceback';
import { Value, nil, Nil } from './value';

import { Chunk } from './bytecode/chunk';
import { OpCode } from './bytecode/opcodes';

import * as op from './operations';

export type Globals = Record<string, Value>;

export class Runtime {
  public stack: Stack<Value>;
  public pc: number = -1;
  public chunk: Chunk = new Chunk();
  public globals: Globals = {};

  constructor(private host: Host) {
    this.stack = new Stack();
  }

  public reset(): void {
    this.stack = new Stack();
    this.chunk = new Chunk();
    this.pc = 0;
  }

  public interpret(chunk: Chunk): Value | null {
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
  private readByte(): OpCode {
    const code = this.chunk.code[this.pc];
    this.pc++;
    return code;
  }

  private readConstant(): Value {
    return this.chunk.constants[this.readByte()];
  }

  private readString(): string {
    const value = this.readConstant();
    assert.equal(typeof value, 'string', 'Value is string');
    return value as string;
  }

  private createTraceback(): Traceback | null {
    return new Traceback(
      null,
      this.chunk.filename,
      this.chunk.lines[this.pc - 1],
    );
  }

  private run(): Value | null {
    let a: Value | null = null;
    let b: Value | null = null;
    let rv: Value | null = null;

    startTraceExec();

    try {
      while (true) {
        traceExec(this);
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
          case OpCode.GetGlobal:
            a = this.globals[this.readString()];
            this.stack.push(a);
            break;
          case OpCode.DefineGlobal:
            a = this.readString();
            // NOTE: Pops afterwards for garbage collection reasons
            b = this.stack.peek();
            assert.ok(a);
            assert.ok(b);
            this.globals[a] = b;
            this.stack.pop();
            break;
          case OpCode.SetGlobal:
            a = this.readString();
            // NOTE: Pops afterwards for garbage collection reasons
            b = this.stack.peek();
            assert.ok(a);
            assert.ok(b);
            if (typeof this.globals[a] === 'undefined') {
              throw new NameError(`Cannot assign to undefined variable ${a}`);
            }
            this.globals[a] = b;
            // TODO: This is missing from my clox implementation. That's a
            // bug, right?
            this.stack.pop();
            break;
          case OpCode.Eq:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.eq(a, b));
            break;
          case OpCode.Gt:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.gt(a, b));
            break;
          case OpCode.Ge:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.ge(a, b));
            break;
          case OpCode.Lt:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.lt(a, b));
            break;
          case OpCode.Le:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.le(a, b));
            break;
          case OpCode.Ne:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.ne(a, b));
            break;
          case OpCode.Not:
            a = this.stack.pop();
            assert.ok(a);
            this.stack.push(op.not(a));
            break;
          case OpCode.Add:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.add(a, b));
            break;
          case OpCode.Sub:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.sub(a, b));
            break;
          case OpCode.Mul:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.mul(a, b));
            break;
          case OpCode.Div:
            b = this.stack.pop();
            a = this.stack.pop();
            assert.ok(a);
            assert.ok(b);
            this.stack.push(op.div(a, b));
            break;
          case OpCode.Neg:
            a = this.stack.pop();
            assert.ok(a);
            this.stack.push(op.neg(a));
            break;
          case OpCode.Print:
            this.host.writeLine(this.stack.pop());
            break;
          case OpCode.Exit:
            const value = this.stack.pop();
            let exitCode: number;
            if (typeof value === 'number') {
              exitCode = Math.floor(value);
            } else if (value instanceof Nil) {
              exitCode = 0;
            } else if (value) {
              exitCode = 1;
            } else {
              exitCode = 0;
            }
            this.host.exit(exitCode);
            return null;
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
          default:
            this.notImplemented(`Unknown opcode: ${instruction}`);
        }
      }
    } catch (err) {
      if (err instanceof Exit) {
        throw err;
      }

      if (!(err instanceof BaseException)) {
        err = RuntimeFault.fromError(err);
      }

      err.traceback = this.createTraceback();
      throw err;
    }
  }

  private notImplemented(message: string): Value {
    throw new NotImplementedError(message);
  }
}
