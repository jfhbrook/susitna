import { getTracer, showTree } from './debug';
import { errorType } from './errors';
import {
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
  sortParseError,
} from './exceptions';
import { runtimeMethod } from './faults';
import { Scanner } from './scanner';
import { Token, TokenKind } from './tokens';

import {
  Expr,
  Binary,
  Logical,
  Unary,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';
import {
  Instr,
  Assign,
  Print,
  Expression,
  Rem,
  New,
  Load,
  List,
  Renum,
  Save,
  Run,
  End,
  Exit,
  Let,
  ShortIf,
  If,
  Else,
  ElseIf,
  EndIf,
} from './ast/instr';
import { Cmd, Line, Input, Program } from './ast';
import { sortLines } from './ast/util';

const tracer = getTracer('parser');

export interface Arguments {
  parameters: Expr[];
  flags: Record<string, boolean>;
  options: Record<string, Expr>;
}

export interface ArgumentsSpec {
  parameters?: string[];
  flags?: string[];
  options?: string[];
}

export type ParseResult<T> = [T, ParseWarning | null];
export type Row = Line | Cmd;

// The alternative to using exceptions is to set a panicMode flag to ignore
// emitted errors until we can synchronize. This might be worth trying out
// later.
@errorType('Synchronize')
class Synchronize extends Error {
  constructor() {
    super('Synchronize');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

@errorType('StopInstrs')
class StopInstrs extends Error {
  constructor(public instr: Instr | null) {
    super('StopInstrs');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class Parser {
  private filename: string = '<unknown>';
  private scanner: Scanner;

  private previous: Token | null;
  private current: Token;
  private next: Token;
  private nextWs: string = '';

  private lineErrors: Array<SyntaxError | SyntaxWarning> = [];
  private errors: Array<SyntaxError | SyntaxWarning> = [];
  private isError: boolean = false;
  private isWarning: boolean = false;
  private isProgram: boolean = false;
  private isLine: boolean = false;
  private lineNo: number | null = null;
  private cmdNo: number = 0;
  private line: string = '';
  private isShortIf: boolean = false;
  private expectThen: boolean = false;

  constructor() {}

  init(source: string, filename: string, isProgram: boolean) {
    this.filename = filename;
    this.scanner = new Scanner(source, filename);
    this.previous = null;
    const [ws1, current] = this.nextToken();
    this.current = current;
    const [ws2, next] = this.nextToken();
    this.next = next;
    this.nextWs = ws2;
    this.lineErrors = [];
    this.errors = [];
    this.isError = false;
    this.isWarning = false;
    this.isProgram = isProgram;
    this.isLine = false;
    this.lineNo = null;
    this.line = ws1 + this.current.text;
    this.isShortIf = false;

    tracer.trace('current', this.current);
  }

  /**
   * Parse the source as input, returning a list of lines and commands.
   *
   * @param source The source code.
   * @returns A list of lines and commands.
   */
  @runtimeMethod
  public parseInput(source: string): ParseResult<Input> {
    this.init(source, '<input>', false);

    const result = new Input(this.rows());

    // NOTE: errors and warnings are *almost* sorted, but there are
    // certain cases where an error is only known after its expression is
    // parsed - for example, parameter length validation in arguments
    // parsing.
    let warning: ParseWarning | null = null;
    if (this.isError) {
      const err = new ParseError(this.errors);
      sortParseError(err, ['row', 'offsetStart']);
      throw err;
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      warning = new ParseWarning(warnings);
      sortParseError(warning, ['row', 'offsetStart']);
    }

    showTree(result);

    return [result, warning];
  }

  /**
   * Parse the source as a program, returning a Program.
   *
   * @param source The source code.
   * @param filename The source filename.
   * @returns A Program.
   */
  @runtimeMethod
  public parseProgram(source: string, filename: string): ParseResult<Program> {
    this.init(source, filename, true);

    const result = this.rows();
    sortLines(result as Line[]);
    const program = new Program(this.filename, result as Line[]);

    let warning: ParseWarning | null = null;
    if (this.isError) {
      throw new ParseError(this.errors);
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      warning = new ParseWarning(warnings);
    }

    showTree(program);

    return [program, warning];
  }

  private match(...kinds: TokenKind[]): boolean {
    for (const kind of kinds) {
      if (this.check(kind)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(kind: TokenKind): boolean {
    if (this.done) {
      return kind === TokenKind.Eof;
    }
    return this.current.kind === kind;
  }

  private checkNext(kind: TokenKind): boolean {
    if (this.done) {
      return kind === TokenKind.Eof;
    }
    return this.next.kind === kind;
  }

  private nextToken(line: string = ''): [string, Token] {
    const token = this.scanner.nextToken();

    if (token.kind === TokenKind.Whitespace) {
      return this.nextToken(line + token.text);
    }

    return [line, token];
  }

  private advance(): Token {
    this.previous = this.current;
    this.current = this.next;
    this.line += this.nextWs + this.current.text;
    const [ws, next] = this.nextToken();
    this.nextWs = ws;
    this.next = next;

    if (this.current.kind === TokenKind.Illegal) {
      this.syntaxError(this.current, `Illegal token ${this.current.text}`);
    }

    tracer.trace('previous', this.previous ? this.previous.text : null);
    tracer.trace('current', this.current ? this.current.text : null);

    return this.previous as Token;
  }

  private get done(): boolean {
    return this.current.kind == TokenKind.Eof;
  }

  private consume(kind: TokenKind, message: string): Token {
    if (this.check(kind)) return this.advance() as Token;
    this.syntaxError(this.current, message);
  }

  private syntaxError(token: Token, message: string): never {
    tracer.trace('kind', token.kind);
    tracer.trace('message', message);
    const exc = new SyntaxError(message, {
      filename: this.filename,
      row: token.row,
      isLine: this.isLine,
      lineNo: this.lineNo,
      cmdNo: this.isLine ? null : this.cmdNo,
      offsetStart: token.offsetStart,
      offsetEnd: token.offsetEnd,
      source: '<unknown>',
    });
    this.isError = true;
    this.lineErrors.push(exc);
    throw new Synchronize();
  }

  private syntaxWarning(token: Token, message: string): void {
    const exc = new SyntaxWarning(message, {
      filename: this.filename,
      row: token.row,
      isLine: this.isLine,
      lineNo: this.lineNo,
      cmdNo: this.isLine ? null : this.cmdNo,
      offsetStart: token.offsetStart,
      offsetEnd: token.offsetEnd,
      source: '<unknown>',
    });
    this.isWarning = true;
    this.lineErrors.push(exc);
  }

  private rows(): Row[] {
    return tracer.spanSync('rows', () => {
      const rows: Row[] = [];
      while (!this.done) {
        const parsed = this.row();
        if (parsed) {
          rows.push(parsed);
        }
      }
      return rows;
    });
  }

  private row(): Row | null {
    return tracer.spanSync('row', () => {
      const rowNo = this.current.row;

      let cmds: Instr[];
      let source: string;
      try {
        this.lineNumber();

        // If statements allow 'then' at beginning of next line
        this.then();

        cmds = this.instructions();

        source = this.rowEnding();
      } catch (err) {
        if (err instanceof Synchronize) {
          this.syncNextRow();
          return null;
        }
        throw err;
      }

      if (this.lineNo !== null) {
        return new Line(this.lineNo, rowNo, source, cmds);
      }
      this.cmdNo += 10;
      return new Cmd(this.cmdNo, rowNo, source, cmds);
    });
  }

  private lineNumber(): void {
    return tracer.spanSync('lineNumber', () => {
      const prevLineNo = this.lineNo;
      if (this.match(TokenKind.DecimalLiteral)) {
        this.lineNo = this.previous!.value as number;
        this.isLine = true;
      } else if (this.isProgram) {
        this.syntaxError(this.current, 'Expected line number');
      } else {
        this.lineNo = null;
        this.isLine = false;
      }

      if (this.lineNo !== null) {
        if (this.lineNo % 10) {
          this.syntaxWarning(
            this.previous!,
            'Line numbers should be in factors of 10',
          );
        }
        if (this.isProgram && prevLineNo !== null) {
          if (this.lineNo <= prevLineNo) {
            this.syntaxWarning(
              this.previous!,
              'Line numbers should be in order',
            );
          }
        }
      }

      tracer.trace('lineNo', this.lineNo);
    });
  }

  private rowEnding(): string {
    return tracer.spanSync('rowEnding', () => {
      let line = this.line;
      if (line.endsWith('\n')) {
        line = line.slice(0, -1);
      }

      for (const error of this.lineErrors) {
        tracer.trace('set source to line', line);
        error.source = line;
        this.errors.push(error);
      }

      this.lineErrors = [];

      if (!this.match(TokenKind.LineEnding)) {
        const token = this.current;
        this.consume(
          TokenKind.Eof,
          `Unexpected token ${token.text.length ? token.text : token.kind}`,
        );
      }

      const nextLine = this.current.text;

      tracer.trace('reset line', nextLine);
      this.line = nextLine;
      this.isLine = false;

      return line;
    });
  }

  private syncNextInstr() {
    return tracer.spanSync('syncNextInstr', () => {
      // Remarks can be handled in the next attempt at parsing a command
      while (
        ![
          TokenKind.Colon,
          TokenKind.LineEnding,
          TokenKind.Eof,
          TokenKind.Rem,
        ].includes(this.current.kind)
      ) {
        // TODO: Illegal, UnterminatedString
        this.advance();
      }
    });
  }

  private syncNextRow(): void {
    return tracer.spanSync('syncNextRow', () => {
      while (
        ![TokenKind.LineEnding, TokenKind.Eof, TokenKind.Rem].includes(
          this.current.kind,
        )
      ) {
        // TODO: Illegal, UnterminatedString
        this.advance();
      }

      this.rowEnding();
    });
  }

  private get isLineEnding(): boolean {
    return this.done || this.current.kind === TokenKind.LineEnding;
  }

  private instructions(): Instr[] {
    return tracer.spanSync('instructions', () => {
      if (this.isLineEnding) {
        return [];
      }

      let instr: Instr | null = null;
      let instrs: Instr[] = [];
      try {
        instr = this.instruction();
        instrs = instr ? [instr] : [];

        // A remark doesn't need to be separated from a prior command by a
        // colon
        while (this.match(TokenKind.Colon) || this.check(TokenKind.Rem)) {
          try {
            instr = this.instruction();
            if (instr) {
              instrs.push(instr);
            }
          } catch (err) {
            if (err instanceof Synchronize) {
              this.syncNextInstr();
            }
            throw err;
          }
        }
      } catch (err) {
        if (err instanceof StopInstrs) {
          if (err.instr) {
            instrs.push(err.instr);
          }
          return instrs;
        }

        throw err;
      }

      return instrs;
    });
  }

  private instruction(): Instr | null {
    return tracer.spanSync('instruction', () => {
      const { offsetStart } = this.current;

      let instr: Instr;

      const finalize = (instr: Instr): void => {
        const { offsetEnd } = this.previous!;

        instr.offsetStart = offsetStart;
        instr.offsetEnd = offsetEnd;
      };

      try {
        // Remarks are treated like commands - the scanner handles the fact
        // that they include all text to the end of the line
        if (this.match(TokenKind.Rem)) {
          instr = new Rem(this.previous!.value as string);
        } else if (this.match(TokenKind.Semicolon)) {
          instr = new Rem('');
        } else if (this.match(TokenKind.Print)) {
          instr = this.print();
          // TODO: TokenKind.ShellToken (or TokenKind.StringLiteral)
        } else if (this.match(TokenKind.New)) {
          instr = this.new();
        } else if (this.match(TokenKind.Load)) {
          instr = this.load();
        } else if (this.match(TokenKind.List)) {
          instr = this.list();
        } else if (this.match(TokenKind.Renum)) {
          instr = this.renum();
        } else if (this.match(TokenKind.Save)) {
          instr = this.save();
        } else if (this.match(TokenKind.Run)) {
          instr = this.run();
        } else if (this.match(TokenKind.End)) {
          instr = this.end();
        } else if (this.match(TokenKind.Exit)) {
          instr = this.exit();
        } else if (this.match(TokenKind.Let)) {
          instr = this.let();
        } else if (this.match(TokenKind.If)) {
          instr = this.if_();
        } else if (this.match(TokenKind.Else)) {
          instr = this.else_();
        } else if (this.match(TokenKind.EndIf)) {
          instr = this.endIf();
        } else {
          const assign = this.assign();
          if (assign) {
            instr = assign;
          } else {
            instr = this.expressionStatement();
          }
        }
      } catch (err) {
        if (err instanceof StopInstrs && err.instr) {
          finalize(err.instr);
        }
        throw err;
      }

      finalize(instr);

      return instr;
    });
  }

  // TODO: What's the syntax of print? lol
  private print(): Instr {
    return tracer.spanSync('print', () => {
      return new Print(this.expression());
    });
  }

  private new(): Instr {
    return tracer.spanSync('new', () => {
      return new New(this.optionalExpression());
    });
  }

  private load(): Instr {
    return tracer.spanSync('load', () => {
      const { parameters, flags } = this.arguments({
        parameters: ['filename'],
        flags: ['run'],
      });

      const filename = parameters[0];
      return new Load(filename, flags.run || false);
    });
  }

  private list(): Instr {
    return tracer.spanSync('list', () => {
      return new List();
    });
  }

  private renum(): Instr {
    return tracer.spanSync('renum', () => {
      return new Renum();
    });
  }

  private save(): Instr {
    return tracer.spanSync('save', () => {
      return new Save(this.optionalExpression());
    });
  }

  private run(): Instr {
    return tracer.spanSync('run', () => {
      return new Run();
    });
  }

  private end(): Instr {
    // TODO: Should end take an exit code?
    return tracer.spanSync('end', () => {
      return new End();
    });
  }

  private exit(): Instr {
    return tracer.spanSync('exit', () => {
      const expr = this.optionalExpression();
      if (expr) {
        return new Exit(expr);
      }
      return new Exit(null);
    });
  }

  private expressionStatement(): Instr {
    return tracer.spanSync('expressionStatement', () => {
      return new Expression(this.expression());
    });
  }

  private let(): Instr {
    return tracer.spanSync('let', () => {
      let variable: Variable;
      if (
        this.match(
          TokenKind.IntIdent,
          TokenKind.RealIdent,
          TokenKind.BoolIdent,
          TokenKind.StringIdent,
        )
      ) {
        variable = this.variable();
      } else {
        this.syntaxError(this.current, 'Expected variable name');
      }

      let value: Expr | null = null;
      if (this.match(TokenKind.Eq)) {
        value = this.expression();
      }
      return new Let(variable, value);
    });
  }

  private if_(): Instr {
    return tracer.spanSync('if', () => {
      const condition = this.ifCondition();

      // A bare "if" with a multi-line block
      if (!this.isShortIf && this.isLineEnding) {
        const if_ = new If(condition);
        if (this.expectThen) {
          throw new StopInstrs(if_);
        }
        return if_;
      }

      return this.shortIf(condition);
    });
  }

  private ifCondition(): Expr {
    const condition = this.expression();

    if (this.isLineEnding) {
      this.expectThen = true;
    } else {
      this.consume(TokenKind.Then, 'Expected then');
    }

    return condition;
  }

  private shortIf(condition: Expr): Instr {
    return tracer.spanSync('shortIf', () => {
      const prevShortIf = this.isShortIf;
      this.isShortIf = true;

      const then: Instr[] = this.instructions();
      let else_: Instr[] = [];

      if (this.match(TokenKind.Else)) {
        else_ = this.instructions();
      }

      if (!this.isLineEnding) {
        this.consume(TokenKind.EndIf, 'Expected either endif or line ending');
      }

      this.isShortIf = prevShortIf;

      return new ShortIf(condition, then, else_);
    });
  }

  private then(): void {
    return tracer.spanSync('then', () => {
      if (this.expectThen) {
        this.consume(TokenKind.Then, 'Expected then');
        this.expectThen = false;
      }
    });
  }

  private else_(): Instr {
    return tracer.spanSync('else', () => {
      if (this.isShortIf) {
        throw new StopInstrs(null);
      }

      if (this.match(TokenKind.If)) {
        return this.elseIf();
      }

      return new Else();
    });
  }

  private elseIf(): Instr {
    return tracer.spanSync('else if', () => {
      const condition = this.ifCondition();

      const elseIf = new ElseIf(condition);

      if (this.expectThen) {
        throw new StopInstrs(elseIf);
      }
      return elseIf;
    });
  }

  private endIf(): Instr {
    return tracer.spanSync('endif', () => {
      if (this.isShortIf) {
        throw new StopInstrs(null);
      }

      return new EndIf();
    });
  }

  private assign(): Instr | null {
    return tracer.spanSync('assign', () => {
      // We can't match here because we need to check the *next* token
      // before advancing...
      if (
        (this.check(TokenKind.IntIdent) ||
          this.check(TokenKind.RealIdent) ||
          this.check(TokenKind.BoolIdent) ||
          this.check(TokenKind.StringIdent)) &&
        this.checkNext(TokenKind.Eq)
      ) {
        // ...and so we advance here.
        this.advance();
        const variable = this.variable();
        this.consume(TokenKind.Eq, 'Expected =');
        const value = this.expression();
        return new Assign(variable, value);
      }

      return null;
    });
  }

  private arguments(spec: ArgumentsSpec): Arguments {
    return tracer.spanSync('arguments', () => {
      const parameters = spec.parameters || [];
      const argv: Arguments = { parameters: [], flags: {}, options: {} };
      const flagNames: Set<string> = new Set(spec.flags || []);
      const noFlagNames: Set<string> = new Set(
        (spec.flags || []).map((f) => `no-${f}`),
      );
      const optionNames: Set<string> = new Set(spec.options || []);

      let prevParamToken: Token = this.previous!;
      let currParamToken: Token = this.current;
      while (
        !this.check(TokenKind.Colon) &&
        !this.check(TokenKind.Rem) &&
        !this.check(TokenKind.LineEnding) &&
        !this.check(TokenKind.Eof)
      ) {
        if (this.match(TokenKind.LongFlag)) {
          const key = this.previous!.value as string;
          if (flagNames.has(key)) {
            argv.flags[key] = true;
          } else if (noFlagNames.has(key)) {
            argv.flags[key] = false;
          } else if (optionNames.has(key)) {
            argv.options[key] = this.expression();
          }
        } else {
          prevParamToken = currParamToken;
          currParamToken = this.current;
          argv.parameters.push(this.expression());
        }
      }

      if (argv.parameters.length < parameters.length) {
        this.syntaxError(
          currParamToken,
          `Missing parameter '${parameters[argv.parameters.length]}'`,
        );
      } else if (argv.parameters.length > parameters.length) {
        this.syntaxError(prevParamToken, 'Unexpected parameter');
      }

      return argv;
    });
  }

  private optionalExpression(): Expr | null {
    return tracer.spanSync('optionalExpression', () => {
      for (const tok of [
        TokenKind.Colon,
        TokenKind.LineEnding,
        TokenKind.Eof,
      ]) {
        if (this.check(tok)) {
          return null;
        }
      }
      return this.expression();
    });
  }

  private expression(): Expr {
    return tracer.spanSync('expression', () => {
      return this.or();
    });
  }

  private operator<E extends Expr>(
    kinds: TokenKind[],
    operand: () => Expr,
    factory: (l: Expr, o: TokenKind, r: Expr) => E,
  ): Expr {
    let expr: Expr = operand();

    while (this.match(...kinds)) {
      const op = this.previous!.kind;
      const right = operand();

      expr = factory(expr, op, right);
    }

    return expr;
  }

  private or(): Expr {
    return tracer.spanSync('or', () => {
      return this.operator(
        [TokenKind.Or],
        this.and.bind(this),
        (l, o, r) => new Logical(l, o, r),
      );
    });
  }

  private and(): Expr {
    return tracer.spanSync('and', () => {
      return this.operator(
        [TokenKind.And],
        this.equality.bind(this),
        (l, o, r) => new Logical(l, o, r),
      );
    });
  }

  private equality(): Expr {
    return tracer.spanSync('equality', () => {
      return this.operator(
        [TokenKind.Eq, TokenKind.EqEq, TokenKind.BangEq, TokenKind.Ne],
        this.comparison.bind(this),
        (left, op, right) => {
          if (op == TokenKind.Eq) {
            this.syntaxWarning(
              this.previous!,
              'Use `==` instead of `==` for equality',
            );
            op = TokenKind.EqEq;
          } else if (op == TokenKind.BangEq) {
            this.syntaxWarning(
              this.previous!,
              'Use `<>` instead of `!=` for equality',
            );
            op = TokenKind.Ne;
          }

          return new Binary(left, op, right);
        },
      );
    });
  }

  private comparison(): Expr {
    return tracer.spanSync('comparison', () => {
      return this.operator(
        [TokenKind.Gt, TokenKind.Ge, TokenKind.Lt, TokenKind.Le],
        this.term.bind(this),
        (l, o, r) => new Binary(l, o, r),
      );
    });
  }

  private term(): Expr {
    return tracer.spanSync('term', () => {
      return this.operator(
        [TokenKind.Minus, TokenKind.Plus],
        this.factor.bind(this),
        (l, o, r) => new Binary(l, o, r),
      );
    });
  }

  private factor(): Expr {
    return tracer.spanSync('factor', () => {
      return this.operator(
        [TokenKind.Slash, TokenKind.Star],
        this.unary.bind(this),
        (l, o, r) => new Binary(l, o, r),
      );
    });
  }

  private unary(): Expr {
    return tracer.spanSync('unary', () => {
      if (this.match(TokenKind.Not, TokenKind.Minus)) {
        const op = this.previous!.kind;
        const right = this.unary();

        return new Unary(op, right);
      }

      return this.primary();
    });
  }

  private primary(): Expr {
    return tracer.spanSync('primary', () => {
      if (
        this.match(
          TokenKind.DecimalLiteral,
          TokenKind.HexLiteral,
          TokenKind.OctalLiteral,
          TokenKind.BinaryLiteral,
        )
      ) {
        return new IntLiteral(this.previous!.value as number);
      } else if (this.match(TokenKind.RealLiteral)) {
        return new RealLiteral(this.previous!.value as number);
      } else if (this.match(TokenKind.TrueLiteral)) {
        return new BoolLiteral(true);
      } else if (this.match(TokenKind.FalseLiteral)) {
        return new BoolLiteral(false);
      } else if (this.match(TokenKind.StringLiteral)) {
        return this.string();
      } else if (this.match(TokenKind.NilLiteral)) {
        return new NilLiteral();
      } else if (
        this.match(
          TokenKind.IntIdent,
          TokenKind.RealIdent,
          TokenKind.BoolIdent,
          TokenKind.StringIdent,
        )
      ) {
        return this.variable();
      } else if (this.match(TokenKind.LParen)) {
        return this.group();
      } else {
        const token = this.current;
        let msg = `Unexpected token ${token.text.length ? token.text : token.kind}`;

        if (token.kind == TokenKind.UnterminatedStringLiteral) {
          msg = `Unterminated string ${token.text}`;
        }

        this.syntaxError(token, msg);
      }
    });
  }

  private variable(): Variable {
    return tracer.spanSync('variable', () => {
      return new Variable(this.previous!);
    });
  }

  private group(): Expr {
    return tracer.spanSync('group', () => {
      const expr: Expr = this.expression();
      this.consume(TokenKind.RParen, 'Expected `)` after expression');
      return new Group(expr);
    });
  }

  private string(): StringLiteral {
    return tracer.spanSync('string', () => {
      return new StringLiteral(this.parseStringEscapeCodes(false));
    });
  }

  private prompt(): PromptLiteral {
    return tracer.spanSync('prompt', () => {
      return new PromptLiteral(this.parseStringEscapeCodes(true));
    });
  }

  private parseStringEscapeCodes(isPrompt: boolean): string {
    const warnings: SyntaxWarning[] = [];
    const text = this.previous!.text;
    const input = this.previous!.value as string;
    let value: string = '';

    // Skip the first quote character
    let i = 1;

    function advance(): string {
      i++;
      return input[i - 1];
    }

    function done(): boolean {
      // Skip the last quote character
      return i >= input.length - 1;
    }

    while (!done()) {
      const c: string = advance();

      if (c === '\\') {
        const e = advance();
        switch (e) {
          // ANSI bell character.
          case 'a':
            value += '\u{07}';
            break;
          // Backspace.
          case 'b':
            value += '\u{08}';
            break;
          // ANSI escape code.
          case 'e':
            value += '\u001b';
            break;
          case 't':
            // Prompt strings render \t as a time format, not a tab.
            if (isPrompt) {
              value += '\\t';
            } else {
              value += '\t';
            }
            break;
          case 'r':
            value += '\r';
            break;
          case 'v':
            value += '\u{0b}';
            break;
          case 'f':
            value += '\u{0c}';
            break;
          case 'n':
            value += '\n';
            break;
          case "'":
          case '"':
            value += e;
            break;
          case '\\':
            value += '\\';
            break;
          default:
            // We advanced twice, for the \\ and the character respectively
            const offset = this.previous!.offsetStart + i - 2;
            warnings.push(
              new SyntaxWarning(`Invalid escape sequence \`\\${e}\``, {
                filename: this.filename,
                row: this.current.row,
                isLine: this.isLine,
                lineNo: this.lineNo,
                cmdNo: this.isLine ? null : this.cmdNo,
                offsetStart: offset,
                offsetEnd: offset + 2,
                source: '<unknown>',
              }),
            );
            this.isWarning = true;
            value += '\\';
            value += e;
        }
      } else {
        value += c;
      }
    }

    for (const warn of warnings) {
      warn.message += ` in string ${text}`;
      this.lineErrors.push(warn);
      this.isWarning = true;
    }

    return value;
  }
}
