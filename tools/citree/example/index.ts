import { Source } from './source.mjs';
import { Instr } from './instr.mjs';

export interface TreeVisitor<R> {
  visitCmdTree(node: Cmd): R;
  visitLineTree(node: Line): R;
  visitInputTree(node: Input): R;
  visitProgramTree(node: Program): R;
}

export abstract class Tree {
  abstract accept<R>(visitor: TreeVisitor<R>): R;
}

export class Cmd extends Tree {
  constructor(
    public cmdNo: number,
    public row: number,
    public source: Source,
    public instructions: Instr[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitCmdTree(this);
  }
}

export class Line extends Tree {
  constructor(
    public lineNo: number,
    public row: number,
    public source: Source,
    public instructions: Instr[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitLineTree(this);
  }
}

export class Input extends Tree {
  constructor(public input: Array<Cmd | Line>) {
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
