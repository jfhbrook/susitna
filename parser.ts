import {
  BaseException,
  BaseWarning,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { Scanner } from './scanner';
import { Result, Ok, Err, Warn } from './result';
import { Token, TokenKind } from './tokens';

import * as expr from './ast/expr';
import { Cmd } from './ast/cmd';
import { Line } from './ast/line';
import { Program } from './ast/program';

export type Output = Array<Line | Cmd[]>;

class Parser {
  private scanner: Scanner;

  private previous: Token | null = null;
  private current: Token | null = null;
  private next: Token | null = null;

  private result: Output = [];
  private errors: Array<SyntaxError | SyntaxWarning> = [];
  private isError: boolean = false;
  private isWarning: boolean = false;
  private isProgram: boolean = false;
  private isLine: boolean = false;
  private lineNo: number | null = null;

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
  public parseInput(): Result<Output, ParseError, ParseWarning> {
    this.rows();

    if (this.isError) {
      return new Err(this.result, new ParseError(this.errors));
    } else if (this.isWarning) {
      const warnings = this.errors as unknown as SyntaxWarning[];
      return new Warn(this.result, new ParseWarning(warnings));
    }

    return new Ok(this.result);
  }

  /**
   * Parse the source as a program, returning a Program.
   *
   * @returns A Program.
   */
  public parseProgram(): Result<Program, ParseError, ParseWarning> {
    this.isProgram = true;
    this.rows();

    const program = new Program(this.result as Line[]);

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
    if (this.done) return false;
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

  private syntaxError(token: Token, message: string): SyntaxError {
    return new SyntaxError(
      message,
      this.filename,
      this.isLine,
      this.lineNo,
      token.offsetStart,
      token.offsetEnd,
      // TODO: The source of the line
      '',
    );
  }

  private rows(): void {
    while (!this.scanner.done) {
      this.row();
    }
  }

  private row(): void {
    if (this.match(TokenKind.DecimalLiteral)) {
      const lineNo = parseInt(this.previous!.text, 10);
      if (lineNo < 1) {
        this.errors.push(
          this.syntaxError(this.previous, 'Line numbers must be positive'),
        );
      } else {
        this.lineNo = lineNo;
        this.isLine = true;
      }
    }

    this.commands();

    this.isLine = false;
  }

  private commands(): void {
    this.command();

    while (this.match(TokenKind.Colon)) {
      this.command();
    }
    if (this.peek().kind === TokenKind.LineEnding) {
      this.advance();
    } else {
      this.consume(TokenKind.Eof, 'Expected end of line');
    }
  }

  private command(): void {}
}

// TODO: Parse DecimalLiteral
// TODO: Parse LineNo
// TODO: Parse HexLiteral
// TODO: Parse OctalLiteral
// TODO: Parse BinaryLiteral
// TODO: Parse RealLiteral
// TODO: Parse BooleanLiteral
// TODO: Parse StringLiteral
// TODO: Parse Print
// TODO: Parse Command
// TODO: Parse Line
// TODO: Parse Program
// TODO: Sprinkle in Results everywhere

/*
 * Parse input, return a list of lines and commands.
 *
 * @param source The source code.
 * @param filename The source filename.
 */
export function parseInput(
  source: string,
): Result<Output, ParseError, ParseWarning> {
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
