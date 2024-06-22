/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/int.ts > TAP > integration > must match snapshot 1`] = `
import { Expr } from './expr';

export interface CmdVisitor<R> {
  visitExpressionCmd(node: Expression): R;
  visitPrintCmd(node: Print): R;
  visitExitCmd(node: Exit): R;
}

export abstract class Cmd {
  constructor(
    public readonly offsetStart: number,
    public readonly offsetEnd: number,
  ) {}

  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export class Expression extends Cmd {
  constructor(
    public readonly expression: Expr,
    offsetStart: number,
    offsetEnd: number,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitExpressionCmd(this);
  }
}

export class Print extends Cmd {
  constructor(
    public readonly expression: Expr,
    offsetStart: number,
    offsetEnd: number,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitPrintCmd(this);
  }
}

export class Exit extends Cmd {
  constructor(
    public readonly expression: Expr | null,
    offsetStart: number,
    offsetEnd: number,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitExitCmd(this);
  }
}

`

exports[`test/int.ts > TAP > integration > must match snapshot 2`] = `
import { TokenKind } from '../tokens';

export interface ExprVisitor<R> {
  visitUnaryExpr(node: Unary): R;
  visitBinaryExpr(node: Binary): R;
  visitLogicalExpr(node: Logical): R;
  visitGroupExpr(node: Group): R;
  visitIntLiteralExpr(node: IntLiteral): R;
  visitRealLiteralExpr(node: RealLiteral): R;
  visitBoolLiteralExpr(node: BoolLiteral): R;
  visitStringLiteralExpr(node: StringLiteral): R;
  visitPromptLiteralExpr(node: PromptLiteral): R;
  visitNilLiteralExpr(node: NilLiteral): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class Unary extends Expr {
  constructor(
    public readonly op: TokenKind,
    public readonly expr: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Binary extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly op: TokenKind,
    public readonly right: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Logical extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly op: TokenKind,
    public readonly right: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }
}

export class Group extends Expr {
  constructor(public readonly expr: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGroupExpr(this);
  }
}

export class IntLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitIntLiteralExpr(this);
  }
}

export class RealLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitRealLiteralExpr(this);
  }
}

export class BoolLiteral extends Expr {
  constructor(public readonly value: boolean) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBoolLiteralExpr(this);
  }
}

export class StringLiteral extends Expr {
  constructor(public readonly value: string) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitStringLiteralExpr(this);
  }
}

export class PromptLiteral extends Expr {
  constructor(public readonly value: string) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitPromptLiteralExpr(this);
  }
}

export class NilLiteral extends Expr {
  constructor() {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitNilLiteralExpr(this);
  }
}

`

exports[`test/int.ts > TAP > integration > must match snapshot 3`] = `
import { Cmd } from './cmd';

export interface TreeVisitor<R> {
  visitCommandGroupTree(node: CommandGroup): R;
  visitLineTree(node: Line): R;
  visitInputTree(node: Input): R;
  visitProgramTree(node: Program): R;
}

export abstract class Tree {
  abstract accept<R>(visitor: TreeVisitor<R>): R;
}

export class CommandGroup extends Tree {
  constructor(
    public readonly row: number,
    public readonly source: string,
    public readonly commands: Cmd[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitCommandGroupTree(this);
  }
}

export class Line extends Tree {
  constructor(
    public readonly lineNo: number,
    public readonly row: number,
    public readonly source: string,
    public readonly commands: Cmd[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitLineTree(this);
  }
}

export class Input extends Tree {
  constructor(public readonly input: Array<CommandGroup | Line>) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitInputTree(this);
  }
}

export class Program extends Tree {
  constructor(public readonly lines: Line[]) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitProgramTree(this);
  }
}

`
