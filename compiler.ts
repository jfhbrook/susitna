import { getTracer, showChunk } from './debug';
import { errorType } from './errors';
import { SyntaxError, ParseError } from './exceptions';
import { runtimeMethod } from './faults';
import { TokenKind } from './tokens';
import { Value, Type } from './value';
import { Stack } from './stack';
import { Line, Program } from './ast';
import { Cmd, CmdVisitor, Print, Exit, Expression, Rem } from './ast/cmd';
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
  cmdNo?: number;
  cmdSource?: string;
};

export class Compiler implements CmdVisitor<void>, ExprVisitor<void> {
  private ast: Cmd | Program | null;

  private currentChunk: Chunk;
  private lines: Line[] = [];
  private currentCmdNo: number = -1;
  private currentLine: number = 0;

  private filename: string;
  private routineType: RoutineType = RoutineType.Command;

  // private stack: Stack<Type> = new Stack();

  // Set to true whenever an expression command is compiled. In the case of
  // Cmds, this will signal that the result of the single expression
  // should be returned. In Program cases, it's ignored.
  private isExpressionCmd: boolean = false;

  private isError: boolean = false;
  private errors: SyntaxError[] = [];

  constructor(
    ast: Program | Cmd,
    { filename, cmdNo, cmdSource }: CompilerOptions,
  ) {
    this.ast = ast;

    let routineType: RoutineType;
    if (ast instanceof Program) {
      routineType = RoutineType.Program;
      this.lines = (this.ast as Program).lines;
    } else {
      routineType = RoutineType.Command;
      this.lines = [
        new Line(cmdNo || 100, 1, cmdSource || '<unknown>', [this.ast as Cmd]),
      ];
    }

    this.currentChunk = new Chunk();
    this.filename = filename || '<unknown>';
    this.currentChunk.filename = this.filename;
    this.routineType = routineType;
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
      let cmd: Cmd | null = this.advance();
      while (cmd) {
        try {
          this.command(cmd);
          cmd = this.advance();
        } catch (err) {
          if (err instanceof Synchronize) {
            this.synchronize();
            cmd = this.peek();
            continue;
          }
          throw err;
        }
      }

      if (this.isError) {
        throw new ParseError(this.errors);
      }

      this.emitReturn();

      showChunk(this.chunk);
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
      tracer.trace(`current row: ${this.rowNo}`);
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

  private peek(): Cmd | null {
    return tracer.spanSync('peek', () => {
      if (this.done) {
        return null;
      }
      return this.lines[this.currentLine].commands[this.currentCmdNo];
    });
  }

  private syntaxError(cmd: Cmd, message: string): void {
    return tracer.spanSync('syntaxError', () => {
      const exc = new SyntaxError(message, {
        filename: this.filename,
        row: this.rowNo,
        isLine: true,
        lineNo: this.lineNo,
        offsetStart: cmd.offsetStart,
        offsetEnd: cmd.offsetEnd,
        source: this.lineSource,
      });
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

  private get lineNo(): number {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].lineNo;
    }

    return this.lines[this.currentLine].lineNo;
  }

  private get rowNo(): number {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].row;
    }

    return this.lines[this.currentLine].row;
  }

  private get lineSource(): string {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].source;
    }

    return this.lines[this.currentLine].source;
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

  // NOTE: This is only used to emit implicit and bare returns. Valued
  // returns would be handled in visitReturnStmt.
  private emitReturn(): void {
    // NOTE: If/when implementing classes, I would need to detect when
    // compiling a constructor and return "this", not nil.

    if (this.routineType !== RoutineType.Command || !this.isExpressionCmd) {
      this.emitByte(OpCode.Nil);
    }
    this.emitByte(OpCode.Return);
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
      cmd.accept(this);
    });
  }

  visitPrintCmd(print: Print): void {
    tracer.spanSync('visitPrintCmd', () => {
      print.expression.accept(this);
      this.emitByte(OpCode.Print);
    });
  }

  visitExitCmd(exit: Exit): void {
    tracer.spanSync('visitExitCmd', () => {
      if (exit.expression) {
        exit.expression.accept(this);
      } else {
        this.emitConstant(0);
      }
      this.emitByte(OpCode.Exit);
    });
  }

  visitExpressionCmd(expr: Expression): void {
    tracer.spanSync('visitExpressionCmd', () => {
      this.isExpressionCmd = true;
      expr.expression.accept(this);

      // NOTE: In interactive commands, save the result to return later.
      if (this.routineType === RoutineType.Program) {
        this.emitByte(OpCode.Pop);
      }
    });
  }

  visitRemCmd(_rem: Rem): void {}

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
        case TokenKind.EqEq:
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
