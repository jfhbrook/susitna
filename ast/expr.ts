import { Token, TokenKind } from '../scanner';

export interface ExprVisitor<R> {
  visitLineNoExpr(node: LineNo): R;
  visitDecimalLiteralExpr(node: DecimalLiteral): R;
  visitHexLiteralExpr(node: HexLiteral): R;
  visitOctalLiteralExpr(node: OctalLiteral): R;
  visitBinaryLiteralExpr(node: BinaryLiteral): R;
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

export class DecimalLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitDecimalLiteralExpr(this);
  }
}

export class HexLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitHexLiteralExpr(this);
  }
}

export class OctalLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitOctalLiteralExpr(this);
  }
}

export class BinaryLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryLiteralExpr(this);
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
