import { Expr } from './expr';

export interface CmdVisitor<R> {
  visitExpressionCmd(node: Expression): R;
  visitPrintCmd(node: Print): R;
}

export abstract class Cmd {
  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export class Expression extends Cmd {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitExpressionCmd(this);
  }
}

export class Print extends Cmd {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitPrintCmd(this);
  }
}
