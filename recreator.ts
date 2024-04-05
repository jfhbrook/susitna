import { TreeVisitor, CommandGroup, Line, Input, Program } from './ast';
import { CmdVisitor, Expression, Print } from './ast/cmd';
import {
  ExprVisitor,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from './ast/expr';

export class Recreator
  implements TreeVisitor<string>, CmdVisitor<string>, ExprVisitor<string>
{
  recreate(tree: Input | Line | Program): string {
    return tree.accept(this);
  }

  visitCommandGroupTree(group: CommandGroup): string {
    return '';
  }

  visitLineTree(line: Line): string {
    return '';
  }

  visitInputTree(input: Input): string {
    return '';
  }

  visitProgramTree(program: Program): string {
    return '';
  }

  visitExpressionCmd(expression: Expression): string {
    return '';
  }

  visitPrintCmd(print: Print): string {
    return '';
  }

  visitIntLiteralExpr(int: IntLiteral): string {
    return '';
  }

  visitRealLiteralExpr(real: RealLiteral): string {
    return '';
  }

  visitBoolLiteralExpr(bool: BoolLiteral): string {
    return '';
  }

  visitStringLiteralExpr(string: StringLiteral): string {
    return '';
  }

  visitNilLiteralExpr(nil: NilLiteral): string {
    return '';
  }
}
