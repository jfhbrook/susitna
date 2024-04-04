import {
  BaseException,
  BaseWarning,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { RuntimeFault } from './faults';
import { Scanner } from './scanner';
import { Result, Ok, Err, Warn } from './result';
import { Token, TokenKind } from './tokens';

import {
  Expr,
  IntLiteral,
  RealLiteral,
  BooleanLiteral,
  StringLiteral,
} from './ast/expr';
import { Cmd, Print, Expression } from './ast/cmd';
import { Line } from './ast/line';
import { Program } from './ast/program';

export type Row = Line | Cmd[];

class Parser {
  private scanner: Scanner;

  private previous: Token | null = null;
  private current: Token | null = null;
  private next: Token | null = null;

  private errors: Array<SyntaxError | SyntaxWarning> = [];
  private isError: boolean = false;
  private isWarning: boolean = false;
  private isProgram: boolean = false;
  private isLine: boolean = false;
  private lineNo: number | null = null;
  // private line: string = '';

  constructor(
    private source: string,
    private filename: string = '<unknown>',
  ) {
    this.scanner = new Scanner(source, filename);
  }

  /**
   * Parse the source as input, returning a list of lines and commands.
   *
   * @returns A list of lines and commands.
   */
  public parseInput(): Result<Row[], ParseError, ParseWarning> {
    const result = this.rows();

    if (this.isError) {
      return new Err(result, new ParseError(this.errors));
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      return new Warn(result, new ParseWarning(warnings));
    }

    return new Ok(result);
  }

  /**
   * Parse the source as a program, returning a Program.
   *
   * @returns A Program.
   */
  public parseProgram(): Result<Program, ParseError, ParseWarning> {
    this.isProgram = true;

    const result = this.rows();
    const program = new Program(result as Line[]);

    if (this.isError) {
      return new Err(program, new ParseError(this.errors));
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      return new Warn(program, new ParseWarning(warnings));
    }

    return new Ok(program);
  }

  private match(...kinds: TokenKind[]): boolean {
    for (let kind of kinds) {
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
    return this.peek().kind === kind;
  }

  private advance(): Token | null {
    this.previous = this.current;

    if (this.next) {
      this.current = this.next;
      this.next = null;
    } else {
      this.current = this.scanner.nextToken();
    }

    /*
    if (this.previous.kind === TokenKind.LineEnding) {
      this.line = '';
    } else {
      this.line = this.previous!.value as string;
    }
    */

    return this.previous;
  }

  private get done(): boolean {
    return this.peek().kind == TokenKind.Eof;
  }

  private peek(): Token {
    if (!this.next) {
      this.next = this.scanner.nextToken();
    }
    return this.next;
  }

  private consume(
    kind: TokenKind,
    message: string,
  ): Result<Token, SyntaxError, SyntaxWarning> {
    if (this.check(kind)) return new Ok(this.advance());
    const token: Token = this.peek();
    return new Err(token, this.syntaxError(token, message));
  }

  private syntaxError(token: Token, message: string): void {
    const exc = new SyntaxError(
      message,
      this.filename,
      this.isLine,
      this.lineNo,
      token.offsetStart,
      token.offsetEnd,
      '',
    );
    this.isError = true;
    this.errors.push(exc);
  }

  private rows(): Array<Line | Cmd[]> {
    const rows: Array<Line | Cmd[]> = [];
    while (!this.scanner.done) {
      const parsed = this.row();
      if (parsed) {
        rows.push(parsed);
      }
    }
    return rows;
  }

  private row(): Line | Cmd[] | null {
    if (this.match(TokenKind.DecimalLiteral)) {
      const lineNo = this.previous!.value as number;
      if (lineNo < 1) {
        this.syntaxError(this.previous, 'Line numbers must be positive');
        this.syncNextLine();
        return null;
      } else {
        this.lineNo = lineNo;
        this.isLine = true;
      }
    } else if (this.isProgram) {
      this.syntaxError(this.peek(), 'Expected line number');
      this.syncNextLine();
      return null;
    }

    let cmds = this.commands();

    if (this.peek().kind === TokenKind.LineEnding) {
      this.advance();
    } else {
      const res = this.consume(TokenKind.Eof, 'Expected end of line');
      if (res instanceof Err) {
        throw RuntimeFault.fromException(res.error);
      }
    }

    this.isLine = false;

    if (this.isLine) {
      return new Line(this.lineNo, cmds);
    }
    return cmds;
  }

  private syncNextCommand() {
    while (
      ![TokenKind.Colon, TokenKind.LineEnding, TokenKind.Eof].includes(
        this.peek().kind,
      )
    ) {
      this.advance();
    }
    this.advance();
  }

  private syncNextLine() {
    while (![TokenKind.LineEnding, TokenKind.Eof].includes(this.peek().kind)) {
      this.advance();
    }
    this.advance();
  }

  private commands(): Cmd[] {
    const cmds: Cmd[] = [this.command()];

    while (this.match(TokenKind.Colon)) {
      cmds.push(this.command());
    }

    return cmds;
  }

  private command(): Cmd {
    if (this.match(TokenKind.Print)) {
      return this.print();
    } else {
      return new Expression(this.expr());
    }
  }

  // TODO: What's the syntax of print? lol
  private print(): Cmd {
    return new Print(this.expr());
  }

  private expr(): Expr {
    return this.primary();
  }

  private primary(): Expr {
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
    } else if (this.match(TokenKind.TrueLiteral, TokenKind.FalseLiteral)) {
      return new BooleanLiteral(this.previous.value as boolean);
    } else if (this.match(TokenKind.StringLiteral)) {
      return new StringLiteral(this.previous.value as string);
    }
  }
}

/*
 * Parse input, return a list of lines and commands.
 *
 * @param source The source code.
 * @param filename The source filename.
 */
export function parseInput(
  source: string,
): Result<Row[], ParseError, ParseWarning> {
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
): Result<Program, ParseError, ParseWarning> {
  const parser = new Parser(source, filename);
  return parser.parseProgram();
}
