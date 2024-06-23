import { getTracer, showTree } from './debug';
import { errorType } from './errors';
import {
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { runtimeMethod, RuntimeFault } from './faults';
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
import { Cmd, Print, Exit, Expression } from './ast/cmd';
import { CommandGroup, Line, Input, Program } from './ast';
import { compareLines } from './ast/util';

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

class Parser {
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
  private line: string = '';

  constructor(
    source: string,
    private filename: string = '<unknown>',
  ) {
    this.scanner = new Scanner(source, filename);
    this.current = this.scanner.nextToken();
    this.line = this.current.text;
    tracer.trace('current', this.current);
  }

  /**
   * Parse the source as input, returning a list of lines and commands.
   *
   * @returns A list of lines and commands.
   */
  @runtimeMethod
  public parseInput(): ParseResult<Input> {
    return tracer.spanSync('parseInput', () => {
      const result = new Input(this.rows());

      if (this.isError) {
        throw new ParseError(this.errors);
      } else if (this.isWarning) {
        const warnings = this.errors as unknown as SyntaxWarning[];
        return [result, new ParseWarning(warnings)];
      }

      return [result, null];
    });
  }

  /**
   * Parse the source as a program, returning a Program.
   *
   * @returns A Program.
   */
  @runtimeMethod
  public parseProgram(): ParseResult<Program> {
    return tracer.spanSync('parseProgram', () => {
      this.isProgram = true;

      const result = this.rows();
      result.sort(compareLines);
      const program = new Program(result as Line[]);

      if (this.isError) {
        throw new ParseError(this.errors);
      } else if (this.isWarning) {
        const warnings = this.errors as unknown as SyntaxWarning[];
        return [program, new ParseWarning(warnings)];
      }

      return [program, null];
    });
  }

  private match(...kinds: TokenKind[]): boolean {
    tracer.trace(`match ${kinds.join(' ')}`);
    for (const kind of kinds) {
      if (this.check(kind)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(kind: TokenKind): boolean {
    tracer.trace(`check ${kind}`);
    if (this.done) {
      return kind === TokenKind.Eof;
    }
    return this.peek().kind === kind;
  }

  private advance(): Token | null {
    return tracer.spanSync('advance', () => {
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
      tracer.trace('line', this.line);

      return this.previous;
    });
  }

  private get done(): boolean {
    return tracer.spanSync('done', () => {
      return this.peek().kind == TokenKind.Eof;
    });
  }

  private peek(): Token {
    tracer.trace(`peek (${this.current.kind})`);
    return this.current;
  }

  private peekPrev(): Token {
    tracer.trace(`prev (${this.previous.kind})`);
    return this.previous;
  }

  private consume(kind: TokenKind, message: string): Token {
    return tracer.spanSync('consume', () => {
      tracer.trace('kind', kind);
      if (this.check(kind)) return this.advance();
      tracer.trace('failure:', message);
      const token: Token = this.peek();
      this.syntaxError(token, message);
    });
  }

  private syntaxError(token: Token, message: string): void {
    return tracer.spanSync('syntaxError', () => {
      tracer.trace('kind', token.kind);
      tracer.trace('message', message);
      const exc = new SyntaxError(message, {
        filename: this.filename,
        row: token.row,
        isLine: this.isLine,
        lineNo: this.lineNo,
        offsetStart: token.offsetStart,
        offsetEnd: token.offsetEnd,
        source: '<unknown>',
      });
      this.isError = true;
      this.lineErrors.push(exc);
      throw new Synchronize();
    });
  }

  private syntaxWarning(token: Token, message: string): void {
    return tracer.spanSync('syntaxWarning', () => {
      tracer.trace('kind', token.kind);
      tracer.trace('message', message);
      const exc = new SyntaxWarning(message, {
        filename: this.filename,
        row: token.row,
        isLine: this.isLine,
        lineNo: this.lineNo,
        offsetStart: token.offsetStart,
        offsetEnd: token.offsetEnd,
        source: '<unknown>',
      });
      this.isWarning = true;
      this.lineErrors.push(exc);
    });
  }

  private rows(): Row[] {
    return tracer.spanSync('rows', () => {
      const rows: Row[] = [];
      while (!this.done) {
        const parsed = this.row();
        tracer.trace('parsed row', parsed);
        if (parsed) {
          rows.push(parsed);
        }
      }
      return rows;
    });
  }

  private row(): Row | null {
    return tracer.spanSync('row', () => {
      tracer.trace('previous', this.previous);
      tracer.trace('current', this.current);

      const rowNo = this.peek().row;

      let lineNo: number | null;
      let cmds: Cmd[];
      let source: string;
      try {
        lineNo = this.lineNumber();

        cmds = this.commands();

        source = this.rowEnding();
      } catch (err) {
        if (err instanceof Synchronize) {
          this.syncNextRow();
          return null;
        }
        throw err;
      }

      if (lineNo !== null) {
        return new Line(this.lineNo, rowNo, source, cmds);
      }
      return new CommandGroup(rowNo, source, cmds);
    });
  }

  private lineNumber(): number | null {
    return tracer.spanSync('lineNumber', () => {
      if (this.match(TokenKind.DecimalLiteral)) {
        this.lineNo = this.previous!.value as number;
        this.isLine = true;
      } else if (this.isProgram) {
        this.syntaxError(this.peek(), 'Expected line number');
      } else {
        this.lineNo = null;
        this.isLine = false;
      }

      tracer.trace('lineNo', this.lineNo);

      return this.lineNo;
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
        try {
          this.consume(TokenKind.Eof, 'Expected end of file');
        } catch (err) {
          throw RuntimeFault.fromException(err);
        }
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
      while (
        ![TokenKind.Colon, TokenKind.LineEnding, TokenKind.Eof].includes(
          this.peek().kind,
        )
      ) {
        // TODO: Illegal, UnterminatedString
        this.advance();
      }
    });
  }

  private syncNextRow() {
    return tracer.spanSync('syncNextRow', () => {
      while (
        ![TokenKind.LineEnding, TokenKind.Eof].includes(this.peek().kind)
      ) {
        // TODO: Illegal, UnterminatedString
        this.advance();
      }
      this.rowEnding();
    });
  }

  private commands(): Cmd[] {
    return tracer.spanSync('commands', () => {
      tracer.trace('previous', this.previous);
      tracer.trace('current', this.current);
      if (this.done || this.peek().kind === TokenKind.LineEnding) {
        return [];
      }

      let cmd: Cmd | null = this.command();
      const cmds: Cmd[] = cmd ? [cmd] : [];

      while (this.match(TokenKind.Colon)) {
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
      const { offsetStart } = this.peek();

      let cmd: Cmd | null;

      if (this.match(TokenKind.Print)) {
        cmd = this.print();
        // TODO: TokenKind.ShellToken (or TokenKind.StringLiteral)
      } else if (this.match(TokenKind.Exit)) {
        cmd = this.exit();
      } else {
        cmd = this.expressionStatement();
      }

      const { offsetEnd } = this.peekPrev();

      cmd.offsetStart = offsetStart;
      cmd.offsetEnd = offsetEnd;

      return cmd;
    });
  }

  // TODO: What's the syntax of print? lol
  private print(): Cmd | null {
    return tracer.spanSync('print', () => {
      const expr = this.expression();
      if (expr) {
        return new Print(expr);
      }
      return null;
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

  private expressionStatement(): Cmd {
    return tracer.spanSync('expression statement', () => {
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
      // TODO: logical expressions (and, or)
      return this.equality();
    });
  }

  private binaryOperator(kinds: TokenKind[], operand: () => Expr): Binary {
    let expr: Expr = operand();

    while (this.match(...kinds)) {
      const op = this.previous.kind;
      const right = operand();

      expr = new Binary(expr, op, right);
    }

    return expr as Binary;
  }

  private logicalOperator(kinds: TokenKind[], operand: () => Expr): Logical {
    let expr = operand();

    while (this.match(...kinds)) {
      const op = this.previous.kind;
      const right = operand();

      expr = new Logical(expr, op, right);
    }

    return expr as Binary;
  }

  private equality(): Binary {
    let expr: Expr = this.comparison();

    while (
      this.match(TokenKind.Eq, TokenKind.EqEq, TokenKind.BangEq, TokenKind.Ne)
    ) {
      let op = this.previous.kind;
      if (op == TokenKind.Eq) {
        this.syntaxWarning(
          this.peek(),
          'Use `==` instead of `==` for equality',
        );
        op = TokenKind.EqEq;
      } else if (op == TokenKind.BangEq) {
        this.syntaxWarning(
          this.peek(),
          'Use `<>` instead of `!=` for equality',
        );
        op = TokenKind.Ne;
      }

      const right = this.comparison();

      expr = new Binary(expr, op, right);
    }

    return expr as Binary;
  }

  private comparison(): Binary {
    return this.binaryOperator(
      [TokenKind.Gt, TokenKind.Ge, TokenKind.Lt, TokenKind.Le],
      this.term.bind(this),
    );
  }

  private term(): Binary {
    return this.binaryOperator(
      [TokenKind.Minus, TokenKind.Plus],
      this.factor.bind(this),
    );
  }

  private factor(): Binary {
    return this.binaryOperator(
      [TokenKind.Slash, TokenKind.Star],
      this.unary.bind(this),
    );
  }

  private unary(): Expr {
    if (this.match(TokenKind.Minus)) {
      const op = this.previous.kind;
      const right = this.unary();

      return new Unary(op, right);
    }

    return this.primary();
  }

  private primary(): Expr | null {
    return tracer.spanSync('primary', () => {
      // TODO: Illegal, UnterminatedString
      if (
        this.match(
          TokenKind.DecimalLiteral,
          TokenKind.HexLiteral,
          TokenKind.OctalLiteral,
          TokenKind.BinaryLiteral,
        )
      ) {
        return new IntLiteral(this.previous.value as number);
      } else if (this.match(TokenKind.RealLiteral)) {
        return new RealLiteral(this.previous.value as number);
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
        const token = this.peek();
        this.syntaxError(
          token,
          `Unexpected token ${token.text.length ? token.text : token.kind}`,
        );
        this.syncNextCommand();
        return null;
      }
    });
  }

  private group(): Expr | null {
    const expr = this.expression();
    if (!expr) {
      return null;
    }
    this.consume(TokenKind.RParen, 'Expected `)` after expression');
    return new Group(expr);
  }

  private string(): StringLiteral {
    return new StringLiteral(this.parseStringEscapeCodes(false));
  }

  private prompt(): PromptLiteral {
    return new PromptLiteral(this.parseStringEscapeCodes(true));
  }

  private parseStringEscapeCodes(isPrompt: boolean): string {
    const warnings: SyntaxWarning[] = [];
    const text = this.previous.text;
    const input = this.previous.value as string;
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
            const offset = this.previous.offsetStart + i - 2;
            warnings.push(
              new SyntaxWarning(`Invalid escape sequence \`\\${e}\``, {
                filename: this.filename,
                row: this.current.row,
                isLine: this.isLine,
                lineNo: this.lineNo,
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

/*
 * Parse input, return a list of lines and commands.
 *
 * @param source The source code.
 */
export function parseInput(source: string): ParseResult<Input> {
  const parser = new Parser(source, '<input>');
  const input = parser.parseInput();
  showTree(input[0]);
  return input;
}

/*
 * Parse a program, made up of multipled numbered lines.
 *
 * @param source The source code.
 * @param filename The source filename.
 */
export function parseProgram(
  source: string,
  filename: string,
): ParseResult<Program> {
  const parser = new Parser(source, filename);
  const program = parser.parseProgram();
  showTree(program[0]);
  return program;
}
