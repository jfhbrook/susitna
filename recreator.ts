import { TreeVisitor, CommandGroup, Line, Input, Program } from './ast';
import { CmdVisitor, Expression, Exit, Print, Rem } from './ast/cmd';
import {
  ExprVisitor,
  Binary,
  Logical,
  Unary,
  Group,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';

export class Recreator
  implements TreeVisitor<string>, CmdVisitor<string>, ExprVisitor<string>
{
  recreate(tree: Input | Line | Program): string {
    return tree.accept(this);
  }

  visitCommandGroupTree(_group: CommandGroup): string {
    return '';
  }

  visitLineTree(_line: Line): string {
    return '';
  }

  visitInputTree(_input: Input): string {
    return '';
  }

  visitProgramTree(_program: Program): string {
    return '';
  }

  visitExpressionCmd(_expression: Expression): string {
    return '';
  }

  visitPrintCmd(_print: Print): string {
    return '';
  }

  visitExitCmd(_exit: Exit): string {
    return '';
  }

  visitRemCmd(rem: Rem): string {
    return `rem ${rem.remark}`;
  }

  visitBinaryExpr(_binary: Binary): string {
    return '';
  }

  visitLogicalExpr(_logical: Logical): string {
    return '';
  }

  visitUnaryExpr(_unary: Unary): string {
    return '';
  }

  visitGroupExpr(_group: Group): string {
    return '';
  }

  visitIntLiteralExpr(_int: IntLiteral): string {
    return '';
  }

  visitRealLiteralExpr(_real: RealLiteral): string {
    return '';
  }

  visitBoolLiteralExpr(_bool: BoolLiteral): string {
    return '';
  }

  visitStringLiteralExpr(_string: StringLiteral): string {
    return '';
  }

  visitPromptLiteralExpr(_ps: PromptLiteral): string {
    return '';
  }

  visitNilLiteralExpr(_nil: NilLiteral): string {
    return '';
  }
}
