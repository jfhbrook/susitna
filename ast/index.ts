import { Token, TokenKind } from '../tokens';
import { Cmd } from './cmd';

export interface AstVisitor<R> {
  visitLineAst(node: Line): R;
  visitProgramAst(node: Program): R;
}

export abstract class Ast {
  abstract accept<R>(visitor: AstVisitor<R>): R;
}

export class Line extends Ast {
  constructor(
    public readonly lineNo: number,
    public readonly commands: Cmd[],
  ) {
    super();
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitLineAst(this);
  }
}

export class Program extends Ast {
  constructor(public readonly lines: Line[]) {
    super();
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitProgramAst(this);
  }
}
