import { Expr } from './expr';

export interface CmdVisitor<R> {
  visitExpressionCmd(node: Expression): R;
  visitPrintCmd(node: Print): R;
  visitExitCmd(node: Exit): R;
  visitRemCmd(node: Rem): R;
  visitDeleteLineCmd(node: DeleteLine): R;
}

export abstract class Cmd {
  constructor(
    public offsetStart: number = -1,
    public offsetEnd: number = -1,
  ) {}

  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export class Expression extends Cmd {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitExpressionCmd(this);
  }
}

export class Print extends Cmd {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitPrintCmd(this);
  }
}

export class Exit extends Cmd {
  constructor(
    public expression: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitExitCmd(this);
  }
}

export class Rem extends Cmd {
  constructor(
    public remark: string,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitRemCmd(this);
  }
}

export class DeleteLine extends Cmd {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitDeleteLineCmd(this);
  }
}
