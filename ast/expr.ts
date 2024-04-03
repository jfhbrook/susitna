import { Token, TokenKind } from '../tokens';

export interface ExprVisitor<R> {
  visitLineNoExpr(node: LineNo): R;
  visitIntLiteralExpr(node: IntLiteral): R;
  visitRealLiteralExpr(node: RealLiteral): R;
  visitBooleanLiteralExpr(node: BooleanLiteral): R;
  visitStringLiteralExpr(node: StringLiteral): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class LineNo extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLineNoExpr(this);
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

export class BooleanLiteral extends Expr {
  constructor(public readonly value: boolean) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBooleanLiteralExpr(this);
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
