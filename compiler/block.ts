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
} from '../ast/instr';

import { LineCompiler } from './base';

//
// A class to manage blocks in the LineCompiler. Subclassed for particular
// kinds of blocks in the base, next to the LineCompiler.
//

// NOTE: Conceptually, BlockKind is enumerable. However, as the kinds are
// for the most part defined in the base, setting this to a string allows us
// to avoid a generic type. In practice, block kinds are only used for error
// reporting.
export type BlockKind = string;

export type BlockParent = Block | null;

export interface BlockClass {
  new (compiler: LineCompiler, parent: Block | null): Block;
}

export abstract class Block implements InstrVisitor<BlockParent> {
  public kind: BlockKind = '<unknown>';

  constructor(
    private compiler: LineCompiler,
    public parent: BlockParent = null,
  ) {}

  // Open a new block, maintaining a reference to the parent block.
  public start(cls: BlockClass): void {
    const parent = this.compiler.block;
    this.compiler.block = new cls(this.compiler, parent);
  }

  // End the current block by setting the compiler's block to the next block.
  public end(instr: Instr): void {
    const block = instr.accept(this);
    this.compiler.block = block || this.parent;
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
