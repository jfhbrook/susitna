import { Token } from 'typescript-parsec';
import { TokenKind } from './scanner';
import { Value } from './value';

export interface ExprVisitor<R> {
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

class DecimalLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitDecimalLiteralExpr(this);
  }
}

class HexLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitHexLiteralExpr(this);
  }
}

class OctalLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitOctalLiteralExpr(this);
  }
}

class BinaryLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryLiteralExpr(this);
  }
}

class RealLiteral extends Expr {
  constructor(public readonly value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitRealLiteralExpr(this);
  }
}

class BooleanLiteral extends Expr {
  constructor(public readonly value: boolean) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBooleanLiteralExpr(this);
  }
}

class StringLiteral extends Expr {
  constructor(public readonly value: string) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitStringLiteralExpr(this);
  }
}
