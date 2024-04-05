import { Exception } from './exceptions';
import { Result, Ok } from './result';
import { Tree, TreeVisitor, CommandGroup, Line, Input, Program } from './ast';
import { Cmd, CmdVisitor, Expression, Print } from './ast/cmd';
import {
  Expr,
  ExprVisitor,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from './ast/expr';

export type Node = Tree | Cmd | Expr;
export type CompilerResult<N> = Result<N, Exception>;

export class Compiler
  implements
    TreeVisitor<CompilerResult<Tree>>,
    CmdVisitor<CompilerResult<Tree | Cmd>>,
    ExprVisitor<CompilerResult<Expr>>
{
  compile(tree: Input | Program): CompilerResult<Tree> {
    return tree.accept(this);
  }

  visitCommandGroupTree(group: CommandGroup): CompilerResult<Tree> {
    return new Ok(group);
  }

  visitLineTree(line: Line): CompilerResult<Tree> {
    return new Ok(line);
  }

  visitInputTree(input: Input): CompilerResult<Tree> {
    return new Ok(input);
  }

  visitProgramTree(program: Program): CompilerResult<Tree> {
    return new Ok(program);
  }

  visitExpressionCmd(expression: Expression): CompilerResult<Tree | Cmd> {
    return new Ok(expression);
  }

  visitPrintCmd(print: Print): CompilerResult<Tree | Cmd> {
    return new Ok(print);
  }

  visitIntLiteralExpr(int: IntLiteral): CompilerResult<Expr> {
    return new Ok(int);
  }

  visitRealLiteralExpr(real: RealLiteral): CompilerResult<Expr> {
    return new Ok(real);
  }

  visitBoolLiteralExpr(bool: BoolLiteral): CompilerResult<Expr> {
    return new Ok(bool);
  }

  visitStringLiteralExpr(str: StringLiteral): CompilerResult<Expr> {
    return new Ok(str);
  }

  visitNilLiteralExpr(nil: NilLiteral): CompilerResult<Expr> {
    return new Ok(nil);
  }
}
