import { Token } from 'typescript-parsec';

import { TokenKind } from '../../scanner';

export interface Position {
  index: number;
  rowBegin: number;
  columnBegin: number;
  rowEnd: number;
  columnEnd: number;
}

export interface TestToken {
  kind: TokenKind;
  text: string;
  pos: Position;
}

export function scanAllTokens(token: Token<TokenKind>): TestToken[] {
  const tokens: TestToken[] = [];
  while (token) {
    tokens.push({
      kind: token.kind,
      text: token.text,
      pos: {
        index: token.pos.index,
        rowBegin: token.pos.rowBegin,
        columnBegin: token.pos.columnBegin,
        rowEnd: token.pos.rowEnd,
        columnEnd: token.pos.columnEnd,
      },
    });
    try {
      token = token.next;
    } catch (err) {
      console.error(err);
      break;
    }
  }
  return tokens;
}
