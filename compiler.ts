import { errorType } from './errors';
import { SyntaxError, ParseError } from './exceptions';
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

import { Chunk } from './bytecode/chunk';
// import { OpCode } from './bytecode/opcodes';

export enum RoutineType {
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

export type CompilerOptions = {
  filename?: string;
  saveResult?: boolean;
};

export class Compiler implements CmdVisitor<void>, ExprVisitor<void> {
  private ast: Cmd | Program | null;

  private currentChunk: Chunk = new Chunk();
  private lines: Line[] = [];
  private currentCmd: number = 0;
  private currentLine: number = 0;

  private filename: string = '<input>';
  private routineType: RoutineType = RoutineType.Command;
  private saveResult: boolean = false;

  private isError: boolean = false;
  private errors: SyntaxError[] = [];

  constructor(ast: Program | Cmd, { filename, saveResult }: CompilerOptions) {
    this.ast = ast;

    let routineType: RoutineType;
    if (ast instanceof Program) {
      routineType = RoutineType.Program;
    } else {
      routineType = RoutineType.Command;
    }

    this.currentChunk = new Chunk();
    this.currentLine = 0;
    this.currentCmd = 0;
    this.filename = filename;
    this.routineType = routineType;
    this.saveResult = saveResult || false;
    this.isError = false;
    this.errors = [];
  }

  /**
   * Compile a program.
   *
   * @param program The program to compile.
   * @param filename The source filename.
   */
  @runtimeMethod
  compile(): Chunk {
    if (this.routineType === RoutineType.Program) {
      return this.compileProgram(this.ast as Program);
    } else {
      return this.compileCommand(this.ast as Cmd);
    }
  }

  private compileProgram(program: Program): Chunk {
    this.lines = program.lines;
    while (!this.done) {
      try {
        const cmd = this.advance();
        this.command(cmd);
      } catch (err) {
        if (err instanceof Synchronize) {
          this.synchronize();
        }
        throw err;
      }
    }

    if (this.isError) {
      throw new ParseError(this.errors);
    }

    return this.chunk;
  }

  private compileCommand(cmd: Cmd) {
    try {
      this.command(cmd);
    } catch (err) {
      if (err instanceof Synchronize) {
        // There's nothing to synchronize...
      }
    }

    if (this.isError) {
      throw new ParseError(this.errors);
    }

    return this.chunk;
  }

  get lineNo(): number {
    return this.isLine ? this.lines[this.currentLine].lineNo : -1;
  }

  /**
   * Get the current chunk.
   **/
  get chunk(): Chunk {
    return this.currentChunk;
  }

  // Parsing navigation methods. These are only used when compiling a full
  // program that includes loops.

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

  visitPrintCmd(print: Print): void {
    print.expression.accept(this);
    // push OpCode.Print
  }

  visitExpressionCmd(expr: Expression): void {
    expr.expression.accept(this);
    // TODO: An instruction that saves the expression
    // push OpCode.Pop
  }

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

export function compile(
  ast: Program | Cmd,
  options: CompilerOptions = {},
): Chunk {
  const compiler = new Compiler(ast, options);
  return compiler.compile();
}
