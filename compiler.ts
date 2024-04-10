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

import { Bytecode } from './bytecode';
import { OpCode } from './bytecode/opcodes';

// TODO: The commander implements some non-runtime commands, chiefly around
// editing. This means I have to feed the compiler one command at a time.

export class Compiler implements CmdVisitor<void>, ExprVisitor<void> {
  public current: Bytecode;

  private filename: string = '<input>';
  private lineNo: number = -1;

  constructor() {
    this.current = new Bytecode();
  }

  /**
   * Compile a program into bytecode.
   *
   * @param program The program to compile.
   * @param filename The source filename.
   */
  compileProgram(program: Program, filename: string): Bytecode {
    const oldFilename = this.filename;
    this.filename = filename;
    for (const line of program.lines) {
      for (const cmd of line.commands) {
        this.compileCommand(line.lineNo, cmd);
      }
    }
    this.filename = oldFilename;
    return this.current;
  }

  /*
   * Compile a command into bytecode.
   *
   * @param lineNo The line number for the command.
   * @param cmd The command to compile.
   */
  compileCommand(lineNo: number | null, cmd: Cmd) {
    this.lineNo = lineNo === null ? -1 : lineNo;
    cmd.accept(this);
    this.lineNo = -1;
  }

  reset() {
    this.current = new Bytecode();
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
