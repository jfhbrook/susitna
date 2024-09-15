import { Instr } from './instr';

export interface TreeVisitor<R> {
  visitInstrGroupTree(node: InstrGroup): R;
  visitLineTree(node: Line): R;
  visitInputTree(node: Input): R;
  visitProgramTree(node: Program): R;
}

export abstract class Tree {
  abstract accept<R>(visitor: TreeVisitor<R>): R;
}

export class InstrGroup extends Tree {
  constructor(
    public instrNo: number,
    public row: number,
    public source: string,
    public instructions: Instr[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitInstrGroupTree(this);
  }
}

export class Line extends Tree {
  constructor(
    public lineNo: number,
    public row: number,
    public source: string,
    public instructions: Instr[],
  ) {
    super();
  }

  accept<R>(visitor: TreeVisitor<R>): R {
    return visitor.visitLineTree(this);
  }
}

export class Input extends Tree {
  constructor(public input: Array<InstrGroup | Line>) {
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
