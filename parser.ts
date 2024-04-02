import { Token, TokenError } from 'typescript-parsec';

import {
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { scanner, TokenKind } from './scanner';

import * as expr from './expr';
import * as stmt from './stmt';

export function isTokenError(err: any): err is TokenError {
  if (typeof err.pos === 'undefined') {
    return false;
  }

  const pos: any = err.pos;

  return (
    typeof pos.index === 'number' &&
    typeof pos.rowBegin === 'number' &&
    typeof pos.columnBegin === 'number' &&
    typeof pos.rowEnd === 'number' &&
    typeof pos.columnEnd === 'number'
  );
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

/*
 * Parse a non-numbered command.
 *
 * @param source The source code.
 */
export function parseCommand(source: string): null {
  const warnings: number = 0;
  const errors: number = 0;
  const errorsOrWarnings = [];

  let tokens: Token<TokenKind> | null = null;

  while (source) {
    try {
      const tokens = scanner.parse(source);
    } catch (err) {
      if (isTokenError(err)) {
      }
    }
  }

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
