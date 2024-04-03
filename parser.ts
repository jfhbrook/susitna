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
export function hasNextLine(row: Token[]): boolean {
  return row[0].kind === TokenKind.LineEnding;
}

/**
 * Checks if a row ends in either a line ending or an EOF.
 *
 * @param row A row of tokens.
 */
export function isTerminated(row: Token[]): boolean {
  return isEnd(row) || hasNextLine(row);
}

export interface ParseResult<T> {
  result: T;
  error: ParseError | ParseWarning | null;
}

export type Output = Array<Line | Cmd[]>;

interface RowResult {
  result: Line | Cmd[];
  errors: Array<SyntaxError | SyntaxWarning>;
}

export class Parser {
  private scanner: Scanner;

  constructor(source: string) {
    this.scanner = new Scanner(source);
  }

  /**
   * Parse the source as input, returning a list of lines and commands.
   *
   * @returns A list of lines and commands.
   */
  public parseInput(): ParseResult<Output> {
    let result: Output = [];

    let raiseWarning = false;
    let raiseError = false;
    const errors: Array<SyntaxError | SyntaxWarning> = [];

    let row: Token[] = this.scanner.scanLine();

    while (!isEnd(row)) {
      const { result: res, errors: errs } = this.parseRow(row);
      for (let err of errs) {
        raiseWarning = true;
        if (err instanceof SyntaxError) {
          raiseError = true;
        }
        errors.push(err);
      }
      result.push(res);
    }

    let rv: ParseResult<Output> = {
      result,
      error: null,
    };

    if (raiseError) {
      rv.error = new ParseError(errors);
    } else if (raiseWarning) {
      rv.error = new ParseWarning(errors);
    }

    return rv;
  }

  /**
   * Parse the source as a program, returning a Program.
   *
   * @returns A Program.
   */
  public parseProgram(): ParseResult<Program> {
    let { result, error }: ParseResult<Output> = this.parseInput();

    // TODO: Collect syntax errors.
    for (let res of result) {
      if (!(res instanceof Line)) {
        throw new Error('Expected Line, got Cmd[]');
      }
    }

    return {
      result: new Program(result as Line[]),
      error,
    };
  }

  private parseRow(row: Token[]): RowResult {
    return {
      result: [],
      errors: [],
    };
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
 * Parse a non-numbered command.
 *
 * @param source The source code.
 */
export function parseCommand(source: string): null {
  return null;
}

/*
 * Parse a numbered line.
 *
 * @param source The source code.
 */
export function parseLine(source: string): null {
  return null;
}

/*
 * Parse a program, made up of multipled numbered lines.
 *
 * @param source The source code.
 */
export function parseProgram(source: string): null {
  return null;
}
