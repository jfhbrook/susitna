import { getTracer, showTree } from './debug';
import { errorType } from './errors';
import {
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
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
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';
import {
  Cmd,
  Print,
  Exit,
  Expression,
  Rem,
  New,
  Load,
  List,
  Save,
  Run,
} from './ast/cmd';
import { CommandGroup, Line, Input, Program } from './ast';
import { sortLines } from './ast/util';

const tracer = getTracer('parser');

export type ParseResult<T> = [T, ParseWarning | null];
export type Row = Line | CommandGroup;

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

export class Parser {
  private filename: string = '<unknown>';
  private scanner: Scanner;

  private previous: Token | null;
  private current: Token;

  private lineErrors: Array<SyntaxError | SyntaxWarning> = [];
  private errors: Array<SyntaxError | SyntaxWarning> = [];
  private isError: boolean = false;
  private isWarning: boolean = false;
  private isProgram: boolean = false;
  private isLine: boolean = false;
  private lineNo: number | null = null;
  private cmdNo: number = 0;
  private line: string = '';

  constructor() {}

  init(source: string, filename: string, isProgram: boolean) {
    this.filename = filename;
    this.scanner = new Scanner(source, filename);
    this.previous = null;
    this.current = this.scanner.nextToken();
    this.lineErrors = [];
    this.errors = [];
    this.isError = false;
    this.isWarning = false;
    this.isProgram = isProgram;
    this.isLine = false;
    this.lineNo = null;
    this.line = this.current.text;

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

    let warning: ParseWarning | null = null;
    if (this.isError) {
      throw new ParseError(this.errors);
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      warning = new ParseWarning(warnings);
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

  private advance(): Token | null {
    if (this.current.kind !== TokenKind.Whitespace) {
      this.previous = this.current;
    }
    this.current = this.scanner.nextToken();

    this.line += this.current.text;

    if (this.current.kind === TokenKind.Whitespace) {
      return this.advance();
    }

    if (this.current.kind === TokenKind.Illegal) {
      this.syntaxError(this.current, `Illegal token ${this.current.text}`);
    }

    tracer.trace('previous', this.previous ? this.previous.text : null);
    tracer.trace('current', this.current ? this.current.text : null);

    return this.previous;
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
      lineNo: this.lineNo === null ? -1 : this.lineNo,
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
      lineNo: this.lineNo === null ? -1 : this.lineNo,
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

      let cmds: Cmd[];
      let source: string;
      try {
        this.lineNumber();

        cmds = this.commands();

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
      return new CommandGroup(this.cmdNo, rowNo, source, cmds);
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

  private syncNextCommand() {
    return tracer.spanSync('syncNextCommand', () => {
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

  private commands(): Cmd[] {
    return tracer.spanSync('commands', () => {
      if (this.done || this.current.kind === TokenKind.LineEnding) {
        return [];
      }

      let cmd: Cmd | null = this.command();
      const cmds: Cmd[] = cmd ? [cmd] : [];

      // A remark doesn't need to be separated from a prior command by a
      // colon
      while (this.match(TokenKind.Colon) || this.check(TokenKind.Rem)) {
        try {
          cmd = this.command();
          if (cmd) {
            cmds.push(cmd);
          }
        } catch (err) {
          if (err instanceof Synchronize) {
            this.syncNextCommand();
          }
          throw err;
        }
      }

      return cmds;
    });
  }

  private command(): Cmd | null {
    return tracer.spanSync('command', () => {
      const { offsetStart } = this.current;

      let cmd: Cmd;

      // Remarks are treated like commands - the scanner handles the fact
      // that they include all text to the end of the line
      if (this.match(TokenKind.Rem)) {
        cmd = new Rem(this.previous!.value as string);
      } else if (this.match(TokenKind.Semicolon)) {
        cmd = new Rem('');
      } else if (this.match(TokenKind.Print)) {
        cmd = this.print();
        // TODO: TokenKind.ShellToken (or TokenKind.StringLiteral)
      } else if (this.match(TokenKind.Exit)) {
        cmd = this.exit();
      } else if (this.match(TokenKind.New)) {
        cmd = this.new();
      } else if (this.match(TokenKind.Load)) {
        cmd = this.load();
      } else if (this.match(TokenKind.List)) {
        cmd = this.list();
      } else if (this.match(TokenKind.Save)) {
        cmd = this.save();
      } else if (this.match(TokenKind.Run)) {
        cmd = this.run();
      } else {
        cmd = this.expressionStatement();
      }

      const { offsetEnd } = this.previous!;

      cmd.offsetStart = offsetStart;
      cmd.offsetEnd = offsetEnd;

      return cmd;
    });
  }

  // TODO: What's the syntax of print? lol
  private print(): Cmd {
    return tracer.spanSync('print', () => {
      return new Print(this.expression());
    });
  }

  private exit(): Cmd {
    return tracer.spanSync('exit', () => {
      const expr = this.optionalExpression();
      if (expr) {
        return new Exit(expr);
      }
      return new Exit(null);
    });
  }

  private new(): Cmd {
    return tracer.spanSync('new', () => {
      return new New(this.optionalExpression());
    });
  }

  private load(): Cmd {
    return tracer.spanSync('load', () => {
      // TODO: Support optional 'run' flag
      return new Load(this.expression(), false);
    });
  }

  private list(): Cmd {
    return tracer.spanSync('list', () => {
      return new List();
    });
  }

  private save(): Cmd {
    return tracer.spanSync('save', () => {
      return new Save(this.optionalExpression());
    });
  }

  private run(): Cmd {
    return tracer.spanSync('run', () => {
      return new Run();
    });
  }

  private expressionStatement(): Cmd {
    return tracer.spanSync('expressionStatement', () => {
      return new Expression(this.expression());
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
      // TODO: assignment
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
                lineNo: this.lineNo === null ? -1 : this.lineNo,
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
