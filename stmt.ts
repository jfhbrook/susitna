import { Token } from 'typescript-parsec';
import { TokenKind } from './scanner';
import { Expr } from './expr';

export interface StmtVisitor<R> {
  visitPrintStmt(node: Print): R;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

class Print extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}
