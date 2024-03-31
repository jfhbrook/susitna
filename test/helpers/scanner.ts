import { expectEOF, expectSingleResult } from 'typescript-parsec';
import { alt, Parser, rep, tok, Token, Lexer } from 'typescript-parsec';
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

// Not necessarily exhaustive list of tokens kinds. Add other token types
// as I write tests.
const TOKENS = [
  TokenKind.LParen,
  TokenKind.RParen,
  TokenKind.Comma,
  TokenKind.Semicolon,
  TokenKind.Colon,
  TokenKind.Equals,
  TokenKind.Hash,

  TokenKind.DecimalLiteral,
  TokenKind.HexLiteral,
  TokenKind.OctalLiteral,
  TokenKind.BinaryLiteral,

  TokenKind.RealLiteral,

  TokenKind.StringLiteral,

  TokenKind.True,
  TokenKind.False,

  TokenKind.Ident,
  TokenKind.StringIdent,

  TokenKind.PathLiteral,
  TokenKind.ShortOpt,
  TokenKind.LongOpt,
  TokenKind.CommandLiteral,

  TokenKind.New,
  TokenKind.Load,
  TokenKind.Save,
  TokenKind.List,
  TokenKind.Run,
  TokenKind.End,

  TokenKind.LineEnding,
  TokenKind.Whitespace,

  TokenKind.Let,
  TokenKind.Data,
  TokenKind.Def,
  TokenKind.Fn,
  TokenKind.DefInt,
  TokenKind.DefDbl,
  TokenKind.DefStr,
  TokenKind.Dim,

  TokenKind.For,
  TokenKind.To,
  TokenKind.Step,
  TokenKind.GoSub,
  TokenKind.GoTo,
  TokenKind.Return,
  TokenKind.If,
  TokenKind.Then,
  TokenKind.Else,
  TokenKind.Next,
  TokenKind.While,

  TokenKind.Erl,
  TokenKind.Err,
  TokenKind.Error,
  TokenKind.Resume,

  TokenKind.Date,
  TokenKind.Time,

  TokenKind.Len,

  TokenKind.Print,

  TokenKind.Cls,
  TokenKind.Cd,
  TokenKind.Cp,
  TokenKind.Rm,
  TokenKind.Touch,
  TokenKind.Mv,
  TokenKind.MkDir,
  TokenKind.RmDir,
  TokenKind.Pwd,
  TokenKind.Export,

  TokenKind.Rem,
  TokenKind.LineEnding,
  TokenKind.Whitespace,
].map(tok);

// A parser that just grabs all tokens and returns them as a list.
export const parser: Parser<TokenKind, Token<TokenKind>[]> = rep(
  alt.apply(null, TOKENS),
);

export function scanTokens(
  scanner: Lexer<TokenKind>,
  source: string,
): TestToken[] {
  return expectSingleResult(expectEOF(parser.parse(scanner.parse(source))));
}
