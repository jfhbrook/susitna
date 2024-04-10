import { CommandGroup, Program } from './ast';
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
import { OpCode } from './bytecode/opcodes';

// TODO: This is roughly copied from clox. But I don't like that these aren't
// strictly functions. Chunk type?
export enum FunctionType {
  Command,
  Program,
}

export class Compiler implements CmdVisitor<void>, ExprVisitor<void> {
  public current: Chunk;

  private filename: string = '<input>';
  private functionType: FunctionType;
  private lineNo: number = -1;

  constructor() {
    this.current = new Chunk();
    this.functionType = FunctionType.Command;
  }

  /**
   * Compile a program.
   *
   * @param program The program to compile.
   * @param filename The source filename.
   */
  compileProgram(program: Program, filename: string): Chunk {
    const oldFilename = this.filename;
    const oldFunctionType = this.functionType;

    this.filename = filename;
    this.functionType = FunctionType.Program;

    for (const line of program.lines) {
      for (const cmd of line.commands) {
        const oldLineNo = this.lineNo;
        this.lineNo = line.lineNo;
        this.compileCommand(cmd);
        this.lineNo = oldLineNo;
      }
    }

    this.filename = oldFilename;
    this.functionType = oldFunctionType;

    return this.current;
  }

  /**
   * Compile a command into bytecode.
   *
   * @param lineNo The line number for the command.
   * @param cmd The command to compile.
   **/
  compileCommand(cmd: Cmd) {
    cmd.accept(this);
  }

  /**
   * Reset the compiler.
   **/
  reset() {
    this.current = new Chunk();
    this.functionType = FunctionType.Command;
  }

  //
  // Commands
  //

  visitPrintCmd(cmd: Print): void {}

  visitExpressionCmd(cmd: Expression): void {}

  // Expressions

  visitUnaryExpr(unary: Unary): void {}

  visitBinaryExpr(binary: Binary): void {}

  visitLogicalExpr(logical: Logical): void {}

  visitGroupExpr(group: Group): void {}

  visitIntLiteralExpr(int: IntLiteral): void {}

  visitRealLiteralExpr(real: RealLiteral): void {}

  visitBoolLiteralExpr(bool: BoolLiteral): void {}

  visitStringLiteralExpr(str: StringLiteral): void {}

  visitPromptLiteralExpr(ps: PromptLiteral): void {}

  visitNilLiteralExpr(_: NilLiteral): void {}
}
