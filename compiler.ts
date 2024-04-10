import { errorType } from './errors';
import { SyntaxError } from './exceptions';
import { runtimeMethod } from './faults';
import { Line, Program } from './ast';
import { Cmd, CmdVisitor, Print, Expression } from './ast/cmd';
import {
  ExprVisitor,
  Unary,
  Binary,
  Logical,
  Group,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';

import { Chunk } from './bytecode';
// import { OpCode } from './bytecode/opcodes';

// TODO: This is roughly copied from clox. But I don't like that these aren't
// strictly functions. Chunk type?
export enum FunctionType {
  Command,
  Program,
}

@errorType('Synchronize')
class Synchronize extends Error {
  constructor() {
    super('Synchronize');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class Compiler implements CmdVisitor<void>, ExprVisitor<void> {
  private currentChunk: Chunk = new Chunk();
  private lines: Line[] = [];
  private currentCmd: number = 0;
  private currentLine: number = 0;

  private filename: string = '<input>';
  private functionType: FunctionType = FunctionType.Command;
  private lineNo: number = -1;

  private isError: boolean = false;
  private errors: SyntaxError[] = [];

  /**
   * Compile a program.
   *
   * @param program The program to compile.
   * @param filename The source filename.
   */
  @runtimeMethod
  compileProgram(program: Program, filename: string): Chunk {
    this.init(filename, FunctionType.Program);

    while (!this.done) {
      const cmd = this.advance();
      this.compileCommand(cmd);
    }

    for (const line of program.lines) {
      try {
        for (const cmd of line.commands) {
          this.lineNo = line.lineNo;
          this.compileCommand(cmd);
        }
      } catch (err) {
        if (err instanceof Synchronize) {
          this.synchronize();
        }
        throw err;
      }
    }

    return this.chunk;
  }

  /**
   * Compile a command into bytecode.
   *
   * @param lineNo The line number for the command.
   * @param cmd The command to compile.
   **/
  @runtimeMethod
  compileCommand(cmd: Cmd) {
    this.init('<input>', FunctionType.Command);

    this.command(cmd);

    return this.chunk;
  }

  /**
   * Reset the compiler.
   **/
  init(filename: string, functionType: FunctionType) {
    this.currentChunk = new Chunk();
    this.lines = [];
    this.currentLine = 0;
    this.currentCmd = 0;
    this.filename = filename;
    this.functionType = functionType;
    this.lineNo = -1;
  }

  /**
   * Get the current chunk.
   **/
  get chunk(): Chunk {
    return this.currentChunk;
  }

  private match(...types: (typeof Cmd)[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: typeof Cmd): boolean {
    if (this.done) return false;
    return this.peek() instanceof type;
  }

  private advance(): Cmd | null {
    if (this.done) {
      return null;
    }
    const cmd = this.peek();
    this.currentCmd++;
    if (this.currentCmd >= this.lines[this.currentLine].commands.length) {
      this.currentLine++;
      this.currentCmd = 0;
    }
    if (this.done) {
      return null;
    }
    return cmd;
  }

  private get done(): boolean {
    return this.currentLine >= this.lines.length;
  }

  private peek(): Cmd {
    return this.lines[this.currentLine].commands[this.currentCmd];
  }

  private consume(type: typeof Cmd, message: string): Cmd {
    if (this.check(type)) return this.advance()!;
    const cmd = this.peek();
    throw this.syntaxError(cmd, message);
  }

  private syntaxError(_cmd: Cmd, message: string): void {
    const exc = new SyntaxError(
      message,
      this.filename,
      -1,
      this.isLine,
      this.lineNo,
      // TODO: Plug in offsets and source. The obvious way to do this is to
      // pass it along from the tokens into the AST. A memory-efficient
      // compromise might be to recreate the line and generate the offsets
      // from there.
      0,
      0,
      '<unknown>',
    );
    this.isError = true;
    this.errors.push(exc);
    throw new Synchronize();
  }

  private synchronize(): void {
    this.currentLine++;
    this.currentCmd = 0;
  }

  private get isLine(): boolean {
    return this.lineNo !== -1;
  }

  //
  // Commands
  //

  private command(cmd: Cmd) {
    cmd.accept(this);
  }

  visitPrintCmd(_print: Print): void {}

  visitExpressionCmd(_expression: Expression): void {}

  // Expressions

  visitUnaryExpr(_unary: Unary): void {}

  visitBinaryExpr(_binary: Binary): void {}

  visitLogicalExpr(_logical: Logical): void {}

  visitGroupExpr(_group: Group): void {}

  visitIntLiteralExpr(_int: IntLiteral): void {}

  visitRealLiteralExpr(_real: RealLiteral): void {}

  visitBoolLiteralExpr(_bool: BoolLiteral): void {}

  visitStringLiteralExpr(_str: StringLiteral): void {}

  visitPromptLiteralExpr(_ps: PromptLiteral): void {}

  visitNilLiteralExpr(_: NilLiteral): void {}
}
