import { Scanner } from '../../scanner';
import { Token, TokenKind } from '../../tokens';

import { FILENAME } from './traceback';

export function scanTokens(source: string): Token[] {
  const scanner = new Scanner(source, FILENAME);
  const tokens: Token[] = [];
  let token = scanner.nextToken();

  while (token.kind !== TokenKind.Eof) {
    if (token.kind !== TokenKind.Whitespace) {
      tokens.push(token);
    }
    token = scanner.nextToken();
  }

  tokens.push(token);

  return tokens;
}
