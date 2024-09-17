import { NotImplementedFault } from './faults';
import {
  Instr,
  InstrVisitor,
  Print,
  Expression,
  Rem,
  New,
  Load,
  List,
  Renum,
  Save,
  Run,
  Exit,
  End,
  Let,
  Assign,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
} from './ast/instr';
import { LineCompiler } from './compiler';

// In general, a block's kind can be determined from its class. However,
// there are times where we need its name as a string - for instance, when
// reporting errors.
enum BlockKind {
  Unknown = 'unknown',
  Program = 'program',
  Command = 'command',
  If = 'if',
  Else = 'else',
  ElseIf = 'else if',
}

export abstract class Block implements InstrVisitor<Block> {
  public kind: BlockKind = BlockKind.Unknown;

  constructor(private compiler: LineCompiler) {}

  public end(instr: Instr): void {
    const block = instr.accept(this);
    this.compiler.block = block;
  }

  // Most instructions do not end any kind of block. This code should never
  // be called by the compiler.
  private invalid(instr: Instr, name: string): never {
    this.compiler.syntaxFault(instr, `${name} can not end blocks`);
  }

  // Some instructions end specific kinds of blocks. By default, such an
  // instruction does not close *this* kind of block.
  public mismatched(instr: Instr, kind: string): never {
    this.compiler.syntaxFault(instr, `${kind} can not end ${this.kind}`);
  }

  visitPrintInstr(print: Print): Block {
    this.invalid(print, 'print');
  }

  visitExpressionInstr(expr: Expression): Block {
    this.invalid(expr, 'expr');
  }

  visitRemInstr(rem: Rem): Block {
    this.invalid(rem, 'rem');
  }

  visitNewInstr(new_: New): Block {
    this.invalid(new_, 'new');
  }

  visitLoadInstr(load: Load): Block {
    this.invalid(load, 'load');
  }

  visitListInstr(list: List): Block {
    this.invalid(list, 'list');
  }

  visitRenumInstr(renum: Renum): Block {
    this.invalid(renum, 'renum');
  }

  visitSaveInstr(save: Save): Block {
    this.invalid(save, 'save');
  }

  visitRunInstr(run: Run): Block {
    this.invalid(run, 'run');
  }

  visitExitInstr(exit: Exit): Block {
    this.invalid(exit, 'exit');
  }

  visitEndInstr(end: End): Block {
    this.invalid(end, 'end');
  }

  visitLetInstr(let_: Let): Block {
    this.invalid(let_, 'let');
  }

  visitAssignInstr(assign: Assign): Block {
    this.invalid(assign, 'assign');
  }

  visitShortIfInstr(shortIf: ShortIf): Block {
    this.invalid(shortIf, 'if');
  }

  visitIfInstr(if_: If): Block {
    this.invalid(if_, 'if');
  }

  visitElseInstr(else_: Else): Block {
    this.mismatched(else_, 'else');
  }

  visitElseIfInstr(elseIf: ElseIf): Block {
    this.mismatched(elseIf, 'else if');
  }

  visitEndIfInstr(endIf: EndIf): Block {
    this.mismatched(endIf, 'endif');
  }
}

export class ProgramBlock extends Block {
  kind = BlockKind.Program;
}

export class CommandBlock extends Block {
  kind = BlockKind.Command;
}

export class IfBlock extends Block {
  kind = BlockKind.If;

  visitEndIfInstr(_endIf: EndIf): Block {
    throw new NotImplementedFault('endif');
  }
}

export class ElseIfBlock extends Block {
  kind = BlockKind.ElseIf;

  visitEndIfInstr(_endIf: EndIf): Block {
    throw new NotImplementedFault('endif');
  }
}

export class ElseBlock extends Block {
  kind = BlockKind.Else;

  visitEndIfInstr(_endIf: EndIf): Block {
    throw new NotImplementedFault('endif');
  }
}
