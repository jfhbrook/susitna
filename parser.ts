import {
  apply,
  tok,
  Parser,
  Token,
  TokenPosition,
  TokenError,
  TokenRangeError,
} from 'typescript-parsec';

import { Result, Ok, Exc } from './result';
import {
  BaseException,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { scanner, TokenKind } from './scanner';

import * as expr from './ast/expr';
import * as cmd from './ast/cmd';

//
// typescript-parsec doesn't properly subclass token errors, so we do a bunch
// of down and dirty duck typing
//

export function isTokenPosition(pos: any): pos is TokenPosition {
  return (
    typeof pos.index === 'number' &&
    typeof pos.rowBegin === 'number' &&
    typeof pos.columnBegin === 'number' &&
    typeof pos.rowEnd === 'number' &&
    typeof pos.columnEnd === 'number'
  );
}

export function isTokenError(err: any): err is TokenError {
  if (typeof err.pos === 'undefined') {
    return false;
  }

  return isTokenPosition(err.pos);
}

export function isTokenRangeError(err: any): err is TokenRangeError {
  if (typeof err.first !== 'undefined') {
    if (!isTokenPosition(err.first)) {
      return false;
    }
    if (err.last) {
      return isTokenPosition(err.last);
    } else {
      return true;
    }
  }

  return !!err.message.match(/^<END-OF-FILE> - /);
}

function applyDecimalLiteral(literal: Token<TokenKind>): expr.DecimalLiteral {
  let int: number;
  try {
    int = parseInt(literal.text, 10);
  } catch (err) {
    // TODO: Wrap in an Exception
    throw err;
  }
  return new expr.DecimalLiteral(int);
}

function parseDecimalLiteral(): Parser<TokenKind, expr.DecimalLiteral> {
  return apply(tok(TokenKind.DecimalLiteral), applyDecimalLiteral);
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
  const warnings: number = 0;
  const errors: number = 0;
  const errorsOrWarnings = [];

  try {
    // TODO: Is there a reasonable way to synchronize after finding an
    // illegal token? Perhaps synchronize to the next chunk of whitespace
    // and parse again?
    const tokens: Token<TokenKind> = scanner.parse(source);
  } catch (err) {
    // TODO: Create a SyntaxError on TokenErrors and TokenRangeErrors
    if (isTokenError(err)) {
      throw err;
    } else if (isTokenRangeError(err)) {
      throw err;
    }
    throw err;
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
