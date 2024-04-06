import { SyntaxWarning } from './exceptions';
import { Formatter, Formattable } from './format';
import { Value } from './value';

export enum TokenKind {
  // A subset of the MSX language, plus a few other things.
  // ref: https://github.com/Konamiman/MSX2-Technical-Handbook/blob/master/md/Chapter2.md/
  LParen = '(',
  RParen = ')',
  Comma = ',',
  Semicolon = ';',
  Colon = ':',
  Dot = '.',

  Plus = '+',
  Minus = '-',
  Star = '*',
  Slash = '/',

  Equals = '=',
  Gt = '>',
  Lt = '<',
  Ge = '>=',
  Le = '<=',
  Ne = '<>',

  Hash = '#',

  DecimalLiteral = '<decimal>',
  HexLiteral = '<hex>',
  OctalLiteral = '<octal>',
  BinaryLiteral = '<binary>',

  RealLiteral = '<real>',

  TrueLiteral = 'true',
  FalseLiteral = 'false',

  StringLiteral = '<string>',

  NilLiteral = 'nil',

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
export interface TokenOptions {
  /**
   * The kind of token.
   */
  kind: TokenKind;

  /**
   * The index of the token in the source string.
   */
  index: number;

  /**
   * The row on which the token resides. This is not the same as the line
   * number, which is handled in the parser.
   */
  row: number;

  /**
   * The column offset on which the token starts.
   */
  offsetStart: number;

  /**
   * The column offset at which the token ends.
   */
  offsetEnd: number;

  /**
   * The original text making up the token.
   */
  text: string;

  /**
   * Any warnings emitted for the token.
   */
  warnings: SyntaxWarning[];

  /**
   * If applicable, the literal value corresponding to the token.
   */
  value: Value | undefined;
}

export class Token implements Formattable {
  readonly kind: TokenKind;
  readonly index: number;
  readonly row: number;
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly text: string;
  warnings: SyntaxWarning[];
  readonly value: Value | undefined;

  constructor(options: TokenOptions) {
    this.kind = options.kind;
    this.index = options.index;
    this.row = options.row;
    this.offsetStart = options.offsetStart;
    this.offsetEnd = options.offsetEnd;
    this.text = options.text;
    this.warnings = options.warnings;
    this.value = options.value;
  }

  format(formatter: Formatter): string {
    return formatter.formatToken(this);
  }
}
