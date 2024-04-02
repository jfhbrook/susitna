import { Token } from './token';
import { Expr } from './expr';

export interface StmtVisitor<R> {
  visitBlockStmt(node: Block): R;
  visitExpressionStmt(node: Expression): R;
  visitFunctionStmt(node: Function): R;
  visitIfStmt(node: If): R;
  visitPrintStmt(node: Print): R;
  visitReturnStmt(node: Return): R;
  visitVarStmt(node: Var): R;
  visitWhileStmt(node: While): R;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

class Block extends Stmt {
  constructor(public readonly statements: Stmt[]) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
}
class Expression extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}
class Function extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly params: Token[],
    public readonly body: Stmt[],
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitFunctionStmt(this);
  }
}
class If extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly thenBranch: Stmt,
    public readonly elseBranch: Stmt | null,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}
class Print extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}
class Return extends Stmt {
  constructor(
    public readonly keyword: Token,
    public readonly value: Expr | null,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitReturnStmt(this);
  }
}
class Var extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly initializer: Expr | null,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitVarStmt(this);
  }
}
class While extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly body: Stmt,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}
