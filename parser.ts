import {
  BaseException,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { Scanner } from './scanner';
import { Token, TokenKind } from './tokens';

import * as expr from './ast/expr';
import { Cmd } from './ast/cmd';
import { Line } from './ast/line';
import { Program } from './ast/program';

/**
 * Checks if a row ends in an EOF.
 *
 * @param row A row of tokens.
 */
export function isEnd(row: Token[]): boolean {
  const kind = row[row.length - 1].kind;
  return kind === TokenKind.Eof;
}

/**
 * Checks if a row ends in a line ending.
 *
 * @param row A row of tokens.
 */
export function hasNextRow(row: Token[]): boolean {
  return row[0].kind === TokenKind.LineEnding;
}

/**
 * Checks if a row ends in either a line ending or an EOF.
 *
 * @param row A row of tokens.
 */
export function isTerminated(row: Token[]): boolean {
  return isEnd(row) || hasNextRow(row);
}

export class Result<T> {
  constructor(public result: T) {}
}

export class Ok<T> extends Result<T> {
  constructor(result: T) {
    super(result);
  }
}

export class Err<T> extends Result<T> {
  constructor(
    result: T,
    public error: ParseError,
  ) {
    super(result);
  }
}

export class Warn<T> extends Result<T> {
  constructor(
    result: T,
    public warning: ParseWarning,
  ) {
    super(result);
  }
}

export type Output = Array<Line | Cmd[]>;

class Parser {
  private scanner: Scanner;
  private result: Output = [];
  private errors: Array<SyntaxError | SyntaxWarning> = [];
  private isError: boolean = false;
  private isWarning: boolean = false;
  private isProgram: boolean = false;
  private lineNo: number = 0;

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
  public parseInput(): Result<Output> {
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
  public parseProgram(): Result<Program> {
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

  private rows(): void {
    while (!this.scanner.done) {
      this.row();
    }
  }

  private row(): void {
    /*
    const tokens: Token[] = [];
    let token = this.nextToken();
    let line = '';
    while (
      token.kind !== TokenKind.LineEnding &&
      token.kind !== TokenKind.Eof
    ) {
      line += token.text;
      if (token.kind !== TokenKind.Whitespace) {
        tokens.push(token);
      }
      token = this.nextToken();
    }
    line += token.text;
    tokens.push(token);

    for (let token of tokens) {
      token.line = line;
    }
    return tokens;
    */
    // Is the first token a positive DecimalLiteral?
    // If so, parse row.slice(1)
    // If not, create a syntax error
    // Either way, parse the row for syntax errors
    // If not a program, pop off the commands
    // Collect/attach raw line
    /*
        this.isError = true;
        this.errors.push(
          new SyntaxError(
            'Source lines must be numbered',
            this.filename,
            lineNo + 1,
            0,
            // TODO: This is busted
            this.row,
          ),
        );
    */
  }
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
export function parseInput(source: string): Result<Output> {
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
): Result<Program> {
  const parser = new Parser(source, filename);
  return parser.parseProgram();
}
