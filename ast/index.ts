import { Token, TokenKind } from '../tokens';
import { Cmd } from './cmd';

export interface TreeVisitor<R> {
  visitCommandGroupTree(node: CommandGroup): R;
  visitLineTree(node: Line): R;
  visitProgramTree(node: Program): R;
}

export abstract class Tree {
  abstract accept<R>(visitor: TreeVisitor<R>): R;
}

export class CommandGroup extends Tree {
  constructor(public readonly commands: Cmd[]) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitCommandGroupTree(this);
  }
}

export class Line extends Tree {
  constructor(
    public readonly lineNo: number,
    public readonly commands: Cmd[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitLineTree(this);
  }
}

export class Program extends Tree {
  constructor(public readonly lines: Line[]) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitProgramTree(this);
  }
}
