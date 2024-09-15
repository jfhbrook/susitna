import { getTracer, showChunk } from './debug';
import { errorType } from './errors';
import {
  SyntaxError,
  ParseError,
  ParseWarning,
  mergeParseErrors,
  NotImplementedError,
} from './exceptions';
import { runtimeMethod } from './faults';
import { Token, TokenKind } from './tokens';
import { Value } from './value';
// import { Type } from './value/types';
// import { Stack } from './stack';
import { Line, Program } from './ast';
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
import {
  Expr,
  ExprVisitor,
  Unary,
  Binary,
  Logical,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';

import { Chunk } from './bytecode/chunk';
import { OpCode } from './bytecode/opcodes';

const tracer = getTracer('compiler');

export enum RoutineType {
  Instruction,
  Program,
}

@errorType('Synchronize')
class Synchronize extends Error {
  constructor() {
    super('Synchronize');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type CompilerOptions = {
  filename?: string;
  cmdNo?: number;
  cmdSource?: string;
};

export type CompileResult<T> = [T, ParseWarning | null];

//
// Compile a series of lines. These lines may be from an entire program,
// or a single line in the context of a compiled instruction.
//
export class LineCompiler implements InstrVisitor<void>, ExprVisitor<void> {
  private currentChunk: Chunk;
  private lines: Line[] = [];
  private currentInstrNo: number = -1;
  private currentLine: number = 0;

  private filename: string;
  private routineType: RoutineType = RoutineType.Instruction;

  // private stack: Stack<Type> = new Stack();

  // Set to true whenever an expression command is compiled. In the case of
  // Instrs, this will signal that the result of the single expression
  // should be returned. In Program cases, it's ignored.
  private isExpressionCmd: boolean = false;

  private isError: boolean = false;
  private errors: SyntaxError[] = [];

  constructor(
    lines: Line[],
    routineType: RoutineType,
    { filename }: CompilerOptions,
  ) {
    this.lines = lines;
    this.routineType = routineType;
    this.currentChunk = new Chunk();
    this.filename = filename || '<unknown>';
    this.currentChunk.filename = this.filename;
    this.routineType = routineType;
    this.isError = false;
    this.errors = [];
  }

  /**
   * Compile a program.
   *
   * @param program The program to compile.
   * @param filename The source filename.
   */
  @runtimeMethod
  compile(): CompileResult<Chunk> {
    return tracer.spanSync('compile', () => {
      let instr: Instr | null = this.advance();
      while (instr) {
        try {
          this.instruction(instr);
          instr = this.advance();
        } catch (err) {
          if (err instanceof Synchronize) {
            this.synchronize();
            instr = this.peek();
            continue;
          }
          throw err;
        }
      }

      if (this.isError) {
        throw new ParseError(this.errors);
      }

      this.emitReturn();

      showChunk(this.chunk);
      return [this.chunk, null];
    });
  }

  /**
   * Get the current chunk.
   **/
  get chunk(): Chunk {
    return this.currentChunk;
  }

  // Parsing navigation methods. These are only used when compiling a full
  // program that includes loops.

  private match(...types: (typeof Instr)[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: typeof Instr): boolean {
    if (this.done) return false;
    return this.peek() instanceof type;
  }

  private advance(): Instr | null {
    if (this.done) {
      return null;
    }
    this.currentInstrNo++;
    if (
      this.currentInstrNo >= this.lines[this.currentLine].instructions.length
    ) {
      this.currentLine++;
      this.currentInstrNo = 0;
    }
    tracer.trace(`current line: ${this.lineNo}`);
    tracer.trace(`current row: ${this.rowNo}`);
    tracer.trace(`current instr: ${this.currentInstrNo}`);
    if (this.done) {
      return null;
    }
    return this.peek();
  }

  private get done(): boolean {
    if (this.currentLine >= this.lines.length) {
      return true;
    } else {
      return false;
    }
  }

  private peek(): Instr | null {
    if (this.done) {
      return null;
    }
    return this.lines[this.currentLine].instructions[this.currentInstrNo];
  }

  private syntaxError(instr: Instr, message: string): never {
    const exc = new SyntaxError(message, {
      filename: this.filename,
      row: this.rowNo,
      isLine: this.routineType !== RoutineType.Instruction,
      lineNo: this.lineNo,
      cmdNo: this.routineType === RoutineType.Instruction ? null : this.lineNo,
      offsetStart: instr.offsetStart,
      offsetEnd: instr.offsetEnd,
      source: this.lineSource,
    });
    this.isError = true;
    this.errors.push(exc);
    throw new Synchronize();
  }

  private interactive(name: string, instr: Instr): never {
    return tracer.spanSync(name, () => {
      this.syntaxError(
        instr,
        `Cannot run interactive command in scripts: ${name}`,
      );
    });
  }

  private synchronize(): void {
    return tracer.spanSync('synchronize', () => {
      this.currentLine++;
      this.currentInstrNo = 0;
    });
  }

  private get lineNo(): number {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].lineNo;
    }

    return this.lines[this.currentLine].lineNo;
  }

  private get rowNo(): number {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].row;
    }

    return this.lines[this.currentLine].row;
  }

  private get lineSource(): string {
    if (this.currentLine >= this.lines.length) {
      return this.lines[this.lines.length - 1].source;
    }

    return this.lines[this.currentLine].source;
  }

  private emitByte(byte: number): void {
    tracer.spanSync('emitByte', () => {
      tracer.trace('byte', byte);
      tracer.trace('lineNo', this.lineNo);
      this.currentChunk.writeOp(byte, this.lineNo);
    });
  }

  private emitBytes(...bytes: number[]): void {
    for (const byte of bytes) {
      try {
        this.emitByte(byte);
      } catch (err) {
        throw err;
      }
    }
  }

  private emitConstant(value: Value): void {
    return tracer.spanSync('emitConstant', () => {
      tracer.trace('value:', value);
      this.emitBytes(OpCode.Constant, this.makeConstant(value));
    });
  }

  private emitIdent(ident: Token): number {
    return tracer.spanSync('emitIdent', () => {
      tracer.trace('ident:', ident.value);
      const constant = this.makeConstant(ident.value as Value);
      this.emitBytes(OpCode.Constant, constant);
      return constant;
    });
  }

  // NOTE: This is only used to emit implicit and bare returns. Valued
  // returns would be handled in visitReturnStmt.
  private emitReturn(): void {
    // NOTE: If/when implementing classes, I would need to detect when
    // compiling a constructor and return "this", not nil.

    if (this.routineType !== RoutineType.Instruction || !this.isExpressionCmd) {
      this.emitByte(OpCode.Nil);
    }
    this.emitByte(OpCode.Return);
  }

  private makeConstant(value: Value): number {
    // TODO: clox validates that the return value is byte sized.
    return this.currentChunk.addConstant(value);
  }

  //
  // Instructions
  //

  private instruction(instr: Instr): void {
    tracer.spanSync('instruction', () => {
      tracer.trace('instr', instr);
      instr.accept(this);
    });
  }

  visitPrintInstr(print: Print): void {
    tracer.spanSync('print', () => {
      print.expression.accept(this);
      this.emitByte(OpCode.Print);
    });
  }

  visitExpressionInstr(expr: Expression): void {
    tracer.spanSync('expression', () => {
      this.isExpressionCmd = true;
      expr.expression.accept(this);

      // NOTE: In commands, save the result to return later.
      if (this.routineType === RoutineType.Program) {
        this.emitByte(OpCode.Pop);
      }
    });
  }

  visitRemInstr(_rem: Rem): void {}

  visitNewInstr(new_: New): void {
    return this.interactive('new', new_);
  }

  visitLoadInstr(load: Load): void {
    return this.interactive('load', load);
  }

  visitListInstr(list: List): void {
    return this.interactive('list', list);
  }

  visitRenumInstr(renum: Renum): void {
    return this.interactive('renum', renum);
  }

  visitSaveInstr(save: Save): void {
    return this.interactive('save', save);
  }

  visitRunInstr(run: Run): void {
    return this.interactive('run', run);
  }

  visitEndInstr(_end: End): void {
    tracer.spanSync('end', () => {
      // TODO: I'm currently treating 'end' as a synonym for 'return nil'.
      // But perhaps it should behave differently? In MSX it also cleans up
      // open file handles.
      this.emitByte(OpCode.Nil);
      this.emitByte(OpCode.Return);
    });
  }

  visitExitInstr(exit: Exit): void {
    tracer.spanSync('exit', () => {
      if (exit.expression) {
        exit.expression.accept(this);
      } else {
        this.emitConstant(0);
      }
      this.emitByte(OpCode.Exit);
    });
  }

  visitLetInstr(let_: Let): void {
    return tracer.spanSync('let', () => {
      const target = this.emitIdent(let_.variable.ident);
      if (let_.value) {
        let_.value.accept(this);
      } else {
        this.emitByte(OpCode.Nil);
      }
      this.emitBytes(OpCode.DefineGlobal, target);
    });
  }

  visitAssignInstr(assign: Assign): void {
    return tracer.spanSync('assign', () => {
      const target = this.emitIdent(assign.variable.ident);
      assign.value.accept(this);
      this.emitBytes(OpCode.SetGlobal, target);
    });
  }

  visitShortIfInstr(_if: ShortIf): void {
    throw new NotImplementedError('ShortIf');
  }

  visitIfInstr(_if: If): void {
    throw new NotImplementedError('If');
  }

  visitElseInstr(_else: Else): void {
    throw new NotImplementedError('Else');
  }

  visitElseIfInstr(_elseIf: ElseIf): void {
    throw new NotImplementedError('ElseIf');
  }

  visitEndIfInstr(_endif: EndIf): void {
    throw new NotImplementedError('EndIf');
  }

  // Expressions

  visitUnaryExpr(unary: Unary): void {
    tracer.spanSync('unary', () => {
      unary.expr.accept(this);
      switch (unary.op) {
        case TokenKind.Minus:
          this.emitByte(OpCode.Neg);
          break;
        default:
          this.syntaxError(this.peek() as Instr, 'Invalid unary operator');
      }
    });
  }

  visitBinaryExpr(binary: Binary): void {
    tracer.spanSync('binary', () => {
      binary.left.accept(this);
      binary.right.accept(this);
      switch (binary.op) {
        case TokenKind.Plus:
          this.emitByte(OpCode.Add);
          break;
        case TokenKind.Minus:
          this.emitByte(OpCode.Sub);
          break;
        case TokenKind.Star:
          this.emitByte(OpCode.Mul);
          break;
        case TokenKind.Slash:
          this.emitByte(OpCode.Div);
          break;
        case TokenKind.EqEq:
          this.emitByte(OpCode.Eq);
          break;
        case TokenKind.Gt:
          this.emitByte(OpCode.Gt);
          break;
        case TokenKind.Ge:
          this.emitByte(OpCode.Ge);
          break;
        case TokenKind.Lt:
          this.emitByte(OpCode.Lt);
          break;
        case TokenKind.Le:
          this.emitByte(OpCode.Le);
          break;
        case TokenKind.Ne:
          this.emitByte(OpCode.Ne);
          break;
        default:
          this.syntaxError(this.peek() as Instr, 'Invalid binary operator');
      }
    });
  }

  visitLogicalExpr(_logical: Logical): void {
    tracer.spanSync('logical', () => {});
  }

  visitGroupExpr(group: Group): void {
    tracer.spanSync('group', () => {
      group.expr.accept(this);
    });
  }

  visitVariableExpr(variable: Variable): void {
    tracer.spanSync('variable', () => {
      const ident = this.emitIdent(variable.ident);
      this.emitBytes(OpCode.GetGlobal, ident);
    });
  }

  visitIntLiteralExpr(int: IntLiteral): void {
    tracer.spanSync('int literal', () => {
      this.emitConstant(int.value);
    });
  }

  visitRealLiteralExpr(real: RealLiteral): void {
    tracer.spanSync('real literal', () => {
      this.emitConstant(real.value);
    });
  }

  visitBoolLiteralExpr(bool: BoolLiteral): void {
    tracer.spanSync('bool literal', () => {
      this.emitConstant(bool.value);
    });
  }

  visitStringLiteralExpr(str: StringLiteral): void {
    tracer.spanSync('string literal', () => {
      this.emitConstant(str.value);
    });
  }

  visitPromptLiteralExpr(_ps: PromptLiteral): void {}

  visitNilLiteralExpr(_: NilLiteral): void {
    tracer.spanSync('nil literal', () => {
      this.emitByte(OpCode.Nil);
    });
  }
}

/**
 * Compile an individual runtime instruction.
 *
 * @param instr An individual runtime instruction to compile.
 * @param options Compiler options.
 * @returns The result of compiling the instruction, plus warnings.
 */
export function compileInstruction(
  instr: Instr,
  options: CompilerOptions = {},
): CompileResult<Chunk> {
  const { cmdNo, cmdSource } = options;
  const lines = [new Line(cmdNo || 100, 1, cmdSource || '<unknown>', [instr])];
  const compiler = new LineCompiler(lines, RoutineType.Instruction, options);
  return compiler.compile();
}

/**
 * Compile an entire program.
 *
 * @param program An entire program to compile.
 * @param options Compiler options.
 * @returns The result of compiling the program, plus warnings.
 */
export function compileProgram(
  program: Program,
  options: CompilerOptions = {},
): CompileResult<Chunk> {
  const compiler = new LineCompiler(
    program.lines,
    RoutineType.Program,
    options,
  );
  return compiler.compile();
}

export type CompiledCmd = [Instr | null, Array<Chunk | null>];

//
// Compiler for both interactive and runtime commands. For more information,
// see the jsdoc for compileCommands.
//
export class CommandCompiler
  implements InstrVisitor<CompileResult<CompiledCmd>>
{
  constructor(private options: CompilerOptions) {}

  // A runtime command
  private runtime(instr: Instr): CompileResult<CompiledCmd> {
    const [chunk, warning] = compileInstruction(instr, this.options);
    return [[null, [chunk]], warning];
  }

  // An interactive command
  private command(
    cmd: Instr,
    exprs: Array<Expr | null>,
  ): CompileResult<CompiledCmd> {
    const results = exprs.map((exp) => {
      if (!exp) {
        return [null, null];
      }

      return compileInstruction(new Expression(exp), this.options);
    });
    const chunks = results.map(([c, _]) => c);
    const warnings: Array<ParseWarning | null> = results.map(([_, w]) => w);
    return [[cmd, chunks], mergeParseErrors(warnings)];
  }

  // An instruction which can *not* be executed as a command. This is distinct
  // from an invalid *interactive* command, which may be executed in the
  // runtime.
  private invalid(cmd: string, instr: Instr): never {
    const { filename, cmdNo, cmdSource } = this.options;

    const exc = new SyntaxError(`Invalid command: ${cmd}`, {
      filename: filename || '<unknown>',
      row: cmdNo || 100,
      isLine: false,
      lineNo: cmdNo || 100,
      cmdNo: cmdNo || 100,
      offsetStart: instr.offsetStart,
      offsetEnd: instr.offsetEnd,
      source: cmdSource || '<unknown>',
    });

    throw new ParseError([exc]);
  }

  visitPrintInstr(print: Print): CompileResult<CompiledCmd> {
    return this.runtime(print);
  }

  visitExpressionInstr(expr: Expression): CompileResult<CompiledCmd> {
    return this.command(expr, [expr.expression]);
  }

  visitRemInstr(rem: Rem): CompileResult<CompiledCmd> {
    return [[rem, []], null];
  }

  visitNewInstr(new_: New): CompileResult<CompiledCmd> {
    return this.command(new_, [new_.filename]);
  }

  visitLoadInstr(load: Load): CompileResult<CompiledCmd> {
    return this.command(load, [load.filename]);
  }

  visitListInstr(list: List): CompileResult<CompiledCmd> {
    return this.command(list, []);
  }

  visitRenumInstr(renum: Renum): CompileResult<CompiledCmd> {
    return this.command(renum, []);
  }

  visitSaveInstr(save: Save): CompileResult<CompiledCmd> {
    return this.command(save, [save.filename]);
  }

  visitRunInstr(run: Run): CompileResult<CompiledCmd> {
    return this.command(run, []);
  }

  visitEndInstr(end: End): CompileResult<CompiledCmd> {
    return this.runtime(end);
  }

  visitExitInstr(exit: Exit): CompileResult<CompiledCmd> {
    return this.runtime(exit);
  }

  visitLetInstr(let_: Let): CompileResult<CompiledCmd> {
    return this.runtime(let_);
  }

  visitAssignInstr(assign: Assign): CompileResult<CompiledCmd> {
    return this.runtime(assign);
  }

  visitShortIfInstr(if_: ShortIf): CompileResult<CompiledCmd> {
    return this.runtime(if_);
  }

  visitIfInstr(if_: If): CompileResult<CompiledCmd> {
    return this.invalid('if', if_);
  }

  visitElseInstr(else_: Else): CompileResult<CompiledCmd> {
    return this.invalid('else', else_);
  }

  visitElseIfInstr(elseIf: ElseIf): CompileResult<CompiledCmd> {
    return this.invalid('else if', elseIf);
  }

  visitEndIfInstr(endif: EndIf): CompileResult<CompiledCmd> {
    return this.invalid('endif', endif);
  }
}

/**
 * Compile a mixture of interactive instructions and commands.
 *
 * @param instrs The instructions to compile.
 * @param options Compiler options.
 * @returns The result of compiling each line, plus warnings.
 */
export function compileCommands(
  cmds: Instr[],
  options: CompilerOptions = {},
): CompileResult<CompiledCmd[]> {
  // TODO: Collect ParseErrors
  const compiler = new CommandCompiler(options);
  const results: CompileResult<CompiledCmd>[] = cmds.map((cmd) =>
    cmd.accept(compiler),
  );
  const commands: CompiledCmd[] = results
    .map(([cmd, _]) => cmd)
    .filter(([c, _]) => !(c instanceof Rem));
  const warnings: Array<ParseWarning | null> = results.reduce(
    (acc, [_, warns]) => (warns ? acc.concat(warns) : acc),
    [] as Array<ParseWarning | null>,
  );
  return [commands, mergeParseErrors(warnings)];
}
