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
