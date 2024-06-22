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
