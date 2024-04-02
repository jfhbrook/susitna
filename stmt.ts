import { Token } from 'typescript-parsec';
import { TokenKind } from './scanner';
import { Expr, LineNo } from './expr';

export interface StmtVisitor<R> {
  visitLineStmt(node: Line): R;
  visitPrintStmt(node: Print): R;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class Line extends Stmt {
  constructor(
    public readonly lineNo: LineNo,
    public readonly command: Expr,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitLineStmt(this);
  }
}

export class Print extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}
