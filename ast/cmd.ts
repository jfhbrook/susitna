import { Token, TokenKind } from '../scanner';
import { Expr, LineNo } from './expr';

export interface CmdVisitor<R> {
  visitLineCmd(node: Line): R;
  visitPrintCmd(node: Print): R;
}

export abstract class Cmd {
  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export class Line extends Cmd {
  constructor(
    public readonly lineNo: LineNo,
    public readonly command: Cmd,
  ) {
    super();
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitLineCmd(this);
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
