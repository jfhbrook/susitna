import { Token, TokenError } from 'typescript-parsec';

import {
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { scanner, TokenKind } from './scanner';

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
