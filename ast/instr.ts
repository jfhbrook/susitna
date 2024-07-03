import { Expr, Variable } from './expr';
import { Line } from './index';

export interface InstrVisitor<R> {
  visitRemInstr(node: Rem): R;
  visitLetInstr(node: Let): R;
  visitAssignInstr(node: Assign): R;
  visitExpressionInstr(node: Expression): R;
  visitPrintInstr(node: Print): R;
  visitExitInstr(node: Exit): R;
  visitEndInstr(node: End): R;
  visitNewInstr(node: New): R;
  visitLoadInstr(node: Load): R;
  visitListInstr(node: List): R;
  visitRenumInstr(node: Renum): R;
  visitRunInstr(node: Run): R;
  visitSaveInstr(node: Save): R;
  visitShortIfInstr(node: ShortIf): R;
  visitIfInstr(node: If): R;
}

export abstract class Instr {
  constructor(
    public offsetStart: number = -1,
    public offsetEnd: number = -1,
  ) {}

  abstract accept<R>(visitor: InstrVisitor<R>): R;
}

export class Rem extends Instr {
  constructor(
    public remark: string,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitRemInstr(this);
  }
}

export class Let extends Instr {
  constructor(
    public variable: Variable,
    public value: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitLetInstr(this);
  }
}

export class Assign extends Instr {
  constructor(
    public variable: Variable,
    public value: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitAssignInstr(this);
  }
}

export class Expression extends Instr {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitExpressionInstr(this);
  }
}

export class Print extends Instr {
  constructor(
    public expression: Expr,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitPrintInstr(this);
  }
}

export class Exit extends Instr {
  constructor(
    public expression: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitExitInstr(this);
  }
}

export class End extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitEndInstr(this);
  }
}

export class New extends Instr {
  constructor(
    public filename: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitNewInstr(this);
  }
}

export class Load extends Instr {
  constructor(
    public filename: Expr,
    public run: boolean,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitLoadInstr(this);
  }
}

export class List extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitListInstr(this);
  }
}

export class Renum extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitRenumInstr(this);
  }
}

export class Run extends Instr {
  constructor(offsetStart: number = -1, offsetEnd: number = -1) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitRunInstr(this);
  }
}

export class Save extends Instr {
  constructor(
    public filename: Expr | null,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitSaveInstr(this);
  }
}

export class ShortIf extends Instr {
  constructor(
    public condition: Expr,
    public then: Instr[],
    public else_: Instr[],
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitShortIfInstr(this);
  }
}

export class If extends Instr {
  constructor(
    public condition: Expr,
    public then: Line[],
    public else_: Line[] | If,
    offsetStart: number = -1,
    offsetEnd: number = -1,
  ) {
    super(offsetStart, offsetEnd);
  }

  accept<R>(visitor: InstrVisitor<R>): R {
    return visitor.visitIfInstr(this);
  }
}
