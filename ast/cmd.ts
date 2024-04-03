import { Token, TokenKind } from '../tokens';
import { Expr } from './expr';

export interface CmdVisitor<R> {
  visitLineCmd(node: Line): R;
  visitPrintCmd(node: Print): R;
}

export abstract class Cmd {
  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export class Line extends Cmd {
  constructor(
    public readonly lineNo: number,
    public readonly commands: Cmd[],
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
