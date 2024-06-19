import { getTracer, showChunk } from './debug';
import { errorType } from './errors';
import { SyntaxError, ParseError } from './exceptions';
import { runtimeMethod } from './faults';
import { TokenKind } from './tokens';
import { Value } from './value';
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
import { OpCode } from './bytecode/opcodes';

const tracer = getTracer('compiler');

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
  // TODO: Interactive commands are tracked by currentCmd, but programs are
  // tracked by currentCmdNo and currentLine. The two mechanisms feels a
  // little dirty. Would I rather create a "ghost line"?
  private currentCmd: Cmd | null = null;
  private lines: Line[] = [];
  private currentCmdNo: number = -1;
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
    return tracer.spanSync('compile', () => {
      let result: Chunk;
      if (this.routineType === RoutineType.Program) {
        result = this.compileProgram(this.ast as Program);
      } else {
        result = this.compileCommand(this.ast as Cmd);
      }
      showChunk(result);
      return result;
    });
  }

  private compileProgram(program: Program): Chunk {
    return tracer.spanSync('compileProgram', () => {
      this.lines = program.lines;
      let cmd: Cmd | null = this.advance();
      while (cmd) {
        try {
          this.command(cmd);
          cmd = this.advance();
        } catch (err) {
          if (err instanceof Synchronize) {
            this.synchronize();
            cmd = this.peek();
          }
          throw err;
        }
      }

      if (this.isError) {
        throw new ParseError(this.errors);
      }

      this.emitByte(OpCode.Return);

      return this.chunk;
    });
  }

  private compileCommand(cmd: Cmd) {
    return tracer.spanSync('compileCommand', () => {
      try {
        this.command(cmd);
        this.emitByte(OpCode.Return);
      } catch (err) {
        // There's nothing to synchronize...
        if (!(err instanceof Synchronize)) {
          throw err;
        }
      }

      if (this.isError) {
        throw new ParseError(this.errors);
      }

      return this.chunk;
    });
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
    return tracer.spanSync('match', () => {
      for (const type of types) {
        if (this.check(type)) {
          this.advance();
          return true;
        }
      }
      return false;
    });
  }

  private check(type: typeof Cmd): boolean {
    return tracer.spanSync('check', () => {
      if (this.done) return false;
      return this.peek() instanceof type;
    });
  }

  private advance(): Cmd | null {
    return tracer.spanSync('advance', () => {
      if (this.done) {
        tracer.trace('already done, returning null');
        return null;
      }
      this.currentCmdNo++;
      if (this.currentCmdNo >= this.lines[this.currentLine].commands.length) {
        this.currentLine++;
        this.currentCmdNo = 0;
      }
      tracer.trace(`current line: ${this.lineNo}`);
      tracer.trace(`current cmd: ${this.currentCmdNo}`);
      if (this.done) {
        tracer.trace('done after advancing, returning null');
        return null;
      }
      return this.peek();
    });
  }

  private get done(): boolean {
    return tracer.spanSync('done?', () => {
      if (this.currentLine >= this.lines.length) {
        tracer.trace('done!');
        return true;
      } else {
        tracer.trace('not done');
        return false;
      }
    });
  }

  private peek(): Cmd {
    return tracer.spanSync('peek', () => {
      if (this.lines.length) {
        return this.lines[this.currentLine].commands[this.currentCmdNo];
      }

      return this.currentCmd as Cmd;
    });
  }

  private syntaxError(_cmd: Cmd, message: string): void {
    return tracer.spanSync('syntaxError', () => {
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
    });
  }

  private synchronize(): void {
    return tracer.spanSync('synchronize', () => {
      this.currentLine++;
      this.currentCmdNo = 0;
    });
  }

  private get isLine(): boolean {
    return this.lines.length > 0;
  }

  private get lineNo(): number {
    if (!this.isLine) {
      return -1;
    }

    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].lineNo;
    }

    return this.isLine ? this.lines[this.currentLine].lineNo : -1;
  }

  private emitByte(byte: number): void {
    tracer.spanSync('emitByte', () => {
      tracer.trace('byte', byte);
      tracer.trace('lineNo', this.lineNo);
      this.currentChunk.writeOp(byte, this.lineNo);
    });
  }

  private emitBytes(...bytes: number[]): void {
    for (const byte of bytes) {
      try {
        this.emitByte(byte);
      } catch (err) {
        throw err;
      }
    }
  }

  private emitConstant(value: Value): void {
    tracer.spanSync('emitConstant', () => {
      this.emitBytes(OpCode.Constant, this.makeConstant(value));
    });
  }

  private makeConstant(value: Value): number {
    // TODO: clox validates that the return value is byte sized.
    return this.currentChunk.addConstant(value);
  }

  //
  // Commands
  //

  private command(cmd: Cmd) {
    tracer.spanSync('command', () => {
      tracer.trace('cmd', cmd);
      this.currentCmd = cmd;
      cmd.accept(this);
      this.currentCmd = null;
    });
  }

  visitPrintCmd(print: Print): void {
    tracer.spanSync('visitPrintCmd', () => {
      print.expression.accept(this);
      this.emitByte(OpCode.Print);
    });
  }

  visitExpressionCmd(expr: Expression): void {
    tracer.spanSync('visitExpressionCmd', () => {
      expr.expression.accept(this);
      // TODO: An instruction that saves the expression
      // this.emitByte(OpCode.Print);
    });
  }

  // Expressions

  visitUnaryExpr(unary: Unary): void {
    tracer.spanSync('visitUnaryExpr', () => {
      unary.expr.accept(this);
      switch (unary.op) {
        case TokenKind.Minus:
          this.emitByte(OpCode.Neg);
          break;
        default:
          this.syntaxError(this.peek(), 'Invalid unary operator');
      }
    });
  }

  visitBinaryExpr(binary: Binary): void {
    tracer.spanSync('visitBinaryExpr', () => {
      binary.left.accept(this);
      binary.right.accept(this);
      switch (binary.op) {
        case TokenKind.Plus:
          this.emitByte(OpCode.Add);
          break;
        case TokenKind.Minus:
          this.emitByte(OpCode.Sub);
          break;
        case TokenKind.Star:
          this.emitByte(OpCode.Mul);
          break;
        case TokenKind.Slash:
          this.emitByte(OpCode.Div);
          break;
        case TokenKind.Eq:
          this.emitByte(OpCode.Eq);
          break;
        case TokenKind.Gt:
          this.emitByte(OpCode.Gt);
          break;
        case TokenKind.Ge:
          this.emitByte(OpCode.Ge);
          break;
        case TokenKind.Lt:
          this.emitByte(OpCode.Lt);
          break;
        case TokenKind.Le:
          this.emitByte(OpCode.Le);
          break;
        case TokenKind.Ne:
          this.emitByte(OpCode.Ne);
          break;
        default:
          this.syntaxError(this.peek(), 'Invalid binary operator');
      }
    });
  }

  visitLogicalExpr(_logical: Logical): void {
    tracer.spanSync('visitLogicalExpr', () => {});
  }

  visitGroupExpr(group: Group): void {
    tracer.spanSync('visitGroupExpr', () => {
      group.expr.accept(this);
    });
  }

  visitIntLiteralExpr(int: IntLiteral): void {
    tracer.spanSync('visitIntLiteralExpr', () => {
      this.emitConstant(int.value);
    });
  }

  visitRealLiteralExpr(real: RealLiteral): void {
    tracer.spanSync('visitRealLiteralExpr', () => {
      this.emitConstant(real.value);
    });
  }

  visitBoolLiteralExpr(bool: BoolLiteral): void {
    tracer.spanSync('visitBoolLiteralExpr', () => {
      this.emitConstant(bool.value);
    });
  }

  visitStringLiteralExpr(str: StringLiteral): void {
    tracer.spanSync('visitStringLiteralExpr', () => {
      this.emitConstant(str.value);
    });
  }

  visitPromptLiteralExpr(_ps: PromptLiteral): void {}

  visitNilLiteralExpr(_: NilLiteral): void {
    tracer.spanSync('visitNilLiteralExpr', () => {
      this.emitByte(OpCode.Nil);
    });
  }
}

export function compile(
  ast: Program | Cmd,
  options: CompilerOptions = {},
): Chunk {
  const compiler = new Compiler(ast, options);
  return compiler.compile();
}
