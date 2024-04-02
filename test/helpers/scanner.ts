import { Token, TokenKind, Scanner } from '../../scanner';

export function scanTokens(source: string): Token[] {
  const scanner = new Scanner(source);
  const tokens: Token[] = [];
  let token = scanner.nextToken();

  while (token.kind !== TokenKind.Eof) {
    tokens.push(token);
    token = scanner.nextToken();
  }

  tokens.push(token);

  return tokens;
}
