import { SyntaxWarning } from './exceptions';
import { Value } from './value';

export enum TokenKind {
  // A subset of the MSX language, plus a few other things.
  // ref: https://github.com/Konamiman/MSX2-Technical-Handbook/blob/master/md/Chapter2.md/
  LParen = '(',
  RParen = ')',
  Comma = ',',
  Semicolon = ';',
  Colon = ':',
  Equals = '=',
  Hash = '#',

  DecimalLiteral = '<decimal>',
  HexLiteral = '<hex>',
  OctalLiteral = '<octal>',
  BinaryLiteral = '<binary>',

  RealLiteral = '<real>',

  TrueLiteral = 'TRUE',
  FalseLiteral = 'FALSE',

  StringLiteral = '<string>',

  Ident = '<ident>',
  StringIdent = '<string-ident>',

  ShellToken = '<shell-token>',

  New = 'new',
  Load = 'load',
  Save = 'save',
  List = 'list',
  Run = 'run',
  End = 'end',

  /*
  Let = 'LET',
  Data = 'DATA',
  Def = 'DEF',
  Fn = 'FN',
  DefInt = 'DEFINT',
  DefDbl = 'DEFDBL',
  DefStr = 'DEFSTR',
  Dim = 'DIM',

  For = 'FOR',
  To = 'TO',
  Step = 'STEP',
  GoSub = 'GOSUB',
  GoTo = 'GOTO',
  Return = 'RETURN',
  If = 'IF',
  Then = 'THEN',
  Else = 'ELSE',
  Next = 'NEXT',
  While = 'WHILE',

  Erl = 'ERL',
  Err = 'ERR',
  Error = 'ERROR',
  Resume = 'RESUME',

  Date = 'DATE',
  Time = 'TIME',

  Len = 'LEN',
  */

  Print = 'print',

  /*
  Cls = 'CLS',
  Cd = 'CD',
  Cp = 'CP',
  Rm = 'RM',
  Touch = 'TOUCH',
  Mv = 'MV',
  MkDir = 'MKDIR',
  RmDir = 'RMDIR',
  Pwd = 'PWD',
  Export = 'EXPORT',
  */

  Rem = '<rem>',
  LineEnding = '\\n',
  Whitespace = '<whitespace>',

  Eof = '<EOF>',
  Illegal = '<illegal>',
  UnterminatedStringLiteral = '<unterminated-string>',
}

/**
 * A token.
 */
export interface Token {
  /**
   * The kind of token.
   */
  readonly kind: TokenKind;

  /**
   * The index of the token in the source string.
   */
  readonly index: number;

  /**
   * The row on which the token resides. This is not the same as the line
   * number, which is handled in the parser.
   */
  readonly row: number;

  /**
   * The column offset on which the token starts.
   */
  readonly offsetStart: number;

  /**
   * The column offset at which the token ends.
   */
  readonly offsetEnd: number;

  /**
   * The original text making up the token.
   */
  readonly text: string;

  /**
   * The line from which the token was scanned.
   */
  line?: string;

  /**
   * Any warnings emitted for the token.
   */
  warnings: SyntaxWarning[];

  /**
   * If applicable, the literal value corresponding to the token.
   */
  readonly value: Value | undefined;
}
