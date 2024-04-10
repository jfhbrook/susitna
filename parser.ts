import { spanSync, trace } from './trace';
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
import { Cmd, Print, Expression } from './ast/cmd';
import { CommandGroup, Line, Input, Program } from './ast';
import { compareLines } from './ast/util';

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
    trace('current', this.current);
  }

  /**
   * Parse the source as input, returning a list of lines and commands.
   *
   * @returns A list of lines and commands.
   */
  @runtimeMethod
  public parseInput(): ParseResult<Input> {
    return spanSync('parseInput', () => {
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
    return spanSync('parseProgram', () => {
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
    trace(`match ${kinds.join(' ')}`);
    for (const kind of kinds) {
      if (this.check(kind)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(kind: TokenKind): boolean {
    trace(`check ${kind}`);
    if (this.done) {
      return kind === TokenKind.Eof;
    }
    return this.peek().kind === kind;
  }

  private advance(): Token | null {
    return spanSync('advance', () => {
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

      trace('previous', this.previous ? this.previous.text : null);
      trace('current', this.current ? this.current.text : null);
      trace('line', this.line);

      return this.previous;
    });
  }

  private get done(): boolean {
    return spanSync('done', () => {
      return this.peek().kind == TokenKind.Eof;
    });
  }

  private peek(): Token {
    trace(`peek (${this.current.kind})`);
    return this.current;
  }

  private consume(kind: TokenKind, message: string): Token {
    return spanSync('consume', () => {
      trace('kind', kind);
      if (this.check(kind)) return this.advance();
      trace('failure:', message);
      const token: Token = this.peek();
      throw this.syntaxError(token, message);
    });
  }

  private syntaxError(token: Token, message: string): void {
    return spanSync('syntaxError', () => {
      trace('kind', token.kind);
      trace('message', message);
      const exc = new SyntaxError(
        message,
        this.filename,
        token.row,
        this.isLine,
        this.lineNo,
        token.offsetStart,
        token.offsetEnd,
        '<unknown>',
      );
      this.isError = true;
      this.lineErrors.push(exc);
      throw new Synchronize();
    });
  }

  private rows(): Row[] {
    return spanSync('rows', () => {
      const rows: Row[] = [];
      while (!this.done) {
        const parsed = this.row();
        trace('parsed row', parsed);
        if (parsed) {
          rows.push(parsed);
        }
      }
      return rows;
    });
  }

  private row(): Row | null {
    return spanSync('row', () => {
      trace('previous', this.previous);
      trace('current', this.current);

      let lineNo: number | null;
      let cmds: CommandGroup;
      try {
        lineNo = this.lineNumber();

        cmds = this.commands();

        this.rowEnding();
      } catch (err) {
        if (err instanceof Synchronize) {
          this.syncNextRow();
          return null;
        }
        throw err;
      }

      if (lineNo !== null) {
        return new Line(this.lineNo, cmds.commands);
      }
      return cmds;
    });
  }

  private lineNumber(): number | null {
    return spanSync('lineNumber', () => {
      if (this.match(TokenKind.DecimalLiteral)) {
        const lineNo = this.previous!.value as number;
        if (lineNo < 1) {
          this.syntaxError(this.previous, 'Line numbers must be positive');
        } else {
          this.lineNo = lineNo;
          this.isLine = true;
        }
      } else if (this.isProgram) {
        this.syntaxError(this.peek(), 'Expected line number');
      } else {
        this.lineNo = null;
        this.isLine = false;
      }

      trace('lineNo', this.lineNo);

      return this.lineNo;
    });
  }

  private rowEnding(): void {
    return spanSync('rowEnding', () => {
      let line = this.line;
      if (line.endsWith('\n')) {
        line = line.slice(0, -1);
      }
      for (const error of this.lineErrors) {
        trace('set source to line', line);
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

      line = this.current.text;

      trace('reset line', line);
      this.line = line;
      this.isLine = false;
    });
  }

  private syncNextCommand() {
    return spanSync('syncNextCommand', () => {
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
    return spanSync('syncNextRow', () => {
      while (
        ![TokenKind.LineEnding, TokenKind.Eof].includes(this.peek().kind)
      ) {
        // TODO: Illegal, UnterminatedString
        this.advance();
      }
      this.rowEnding();
    });
  }

  private commands(): CommandGroup {
    return spanSync('commands', () => {
      trace('previous', this.previous);
      trace('current', this.current);
      if (this.done || this.peek().kind === TokenKind.LineEnding) {
        return new CommandGroup([]);
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

      return new CommandGroup(cmds);
    });
  }

  private command(): Cmd | null {
    return spanSync('command', () => {
      if (this.match(TokenKind.Print)) {
        return this.print();
        // TODO: TokenKind.ShellToken (or TokenKind.StringLiteral)
      } else {
        return this.expressionStatement();
      }
    });
  }

  // TODO: What's the syntax of print? lol
  private print(): Cmd | null {
    return spanSync('print', () => {
      const expr = this.expression();
      if (expr) {
        return new Print(expr);
      }
      return null;
    });
  }

  private expressionStatement(): Cmd | null {
    return spanSync('expression statement', () => {
      const expr = this.expression();
      if (expr) {
        return new Expression(expr);
      }
      return null;
    });
  }

  private expression(): Expr | null {
    return spanSync('expression', () => {
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
    return this.binaryOperator(
      [TokenKind.Ne, TokenKind.Eq],
      this.comparison.bind(this),
    );
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
    return spanSync('primary', () => {
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
            // TODO: Evaluate tabs at runtime?
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
              new SyntaxWarning(
                `Invalid escape sequence \`\\${e}\``,
                this.filename,
                this.current.row,
                this.isLine,
                this.lineNo,
                offset,
                offset + 2,
                '',
              ),
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
  return parser.parseInput();
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
  return parser.parseProgram();
}
