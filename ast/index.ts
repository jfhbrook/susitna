import { Cmd } from './cmd';

export interface TreeVisitor<R> {
  visitCommandGroupTree(node: CommandGroup): R;
  visitLineTree(node: Line): R;
  visitInputTree(node: Input): R;
  visitProgramTree(node: Program): R;
}

export abstract class Tree {
  abstract accept<R>(visitor: TreeVisitor<R>): R;
}

export class CommandGroup extends Tree {
  constructor(
    public row: number,
    public source: string,
    public commands: Cmd[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitCommandGroupTree(this);
  }
}

export class Line extends Tree {
  constructor(
    public lineNo: number,
    public row: number,
    public source: string,
    public commands: Cmd[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitLineTree(this);
  }
}

export class Input extends Tree {
  constructor(public input: Array<CommandGroup | Line>) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitInputTree(this);
  }
}

export class Program extends Tree {
  constructor(
    public filename: string,
    public lines: Line[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitProgramTree(this);
  }
}
