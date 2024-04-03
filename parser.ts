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

export class ParseResult {
  constructor(
    public result: Array<Line | Cmd>,
    public error: ParseError | ParseWarning | null = null,
  ) {}
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
  public parseInput(): Array<Line | Cmd> {
    let output: Array<Line | Cmd> = [];

    let raiseWarning = false;
    let raiseError = false;
    const errors: Array<SyntaxError | SyntaxWarning> = [];

    let row: Token[] = this.scanner.scanLine();

    while (!isEnd(row)) {
      const out = this.parseRow(row);
      if (out instanceof Line) {
        output.push(out);
      } else {
        output = output.concat(out);
      }
    }
    return output;
  }

  /**
   * Parse the source as a program, returning a Program.
   *
   * @returns A Program.
   */
  public parseProgram(): Program {
    let output: Array<Line | Cmd> = this.parseInput();

    for (let out of output) {
      if (!(out instanceof Line)) {
        throw new Error('lol');
      }
    }

    return new Program(output as Line[]);
  }

  private parseRow(row: Token[]): Line | Cmd[] {
    return [];
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
