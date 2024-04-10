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

//
// The compiler will, like the base parser, also follow a recursive descent
// pattern.
//

export class Compiler implements CmdVisitor<void>, ExprVisitor<void> {
  private code: Bytecode;

  private lineNo: number = -1;

  constructor(
    private ast: CommandGroup | Program,
    private filename: string = '<unknown>',
  ) {
    this.code = new Bytecode();
  }

  compileGroup(): Bytecode {
    this.compileCommands(null, (this.ast as CommandGroup).commands);
    return this.code;
  }

  compileProgram(): Bytecode {
    for (const line of (this.ast as Program).lines) {
      this.compileCommands(line.lineNo, line.commands);
    }
    return this.code;
  }

  private compileCommands(lineNo: number | null, cmds: Cmd[]) {
    this.lineNo = lineNo;
    for (const cmd of cmds) {
      cmd.accept(this);
    }
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

/*
 * Compile a command group into bytecode.
 *
 * @param group The command group to compile.
 */
export function compileCommands(group: CommandGroup): Bytecode {
  const compiler = new Compiler(group, '<input>');
  return compiler.compileGroup();
}

/*
 * Compile a program into bytecode.
 *
 * @param program The program to compile.
 * @param filename The source filename.
 */
export function compileProgram(program: Program, filename: string): Bytecode {
  const compiler = new Compiler(program, filename);
  return compiler.compileProgram();
}
