import { Token, TokenKind } from '../tokens';
import { Expr } from './expr';

export interface CmdVisitor<R> {
  visitPrintCmd(node: Print): R;
}

export abstract class Cmd {
  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export class Print extends Cmd {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: CmdVisitor<R>): R {
    return visitor.visitPrintCmd(this);
  }
}
