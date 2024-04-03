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

export interface TokenPosition {
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
   * The column offset on which the token ends.
   */
  readonly offsetEnd: number;
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
   * The original text making up the token.
   */
  readonly text: string;

  /**
   * The line from which the token was scanned.
   */
  line?: string;

  /**
   * If applicable, the literal value corresponding to the token.
   */
  readonly value: Value | undefined;

  /**
   * The position of the token in the source string.
   */
  readonly pos: TokenPosition;
}

export const KEYWORDS: Record<string, TokenKind> = {
  true: TokenKind.TrueLiteral,
  false: TokenKind.FalseLiteral,

  // loading, saving, running etc
  new: TokenKind.New,
  load: TokenKind.Load,
  save: TokenKind.Save,
  list: TokenKind.List,
  run: TokenKind.Run,
  end: TokenKind.End,
  // bload: TokenKind.BLoad,
  // bsave: TokenKind.BSave,
  // resume execution of a paused program
  // cont: TokenKind.Cont,
  // delete: TokenKind.Delete,
  // merge: TokenKind.Merge,
  // restore: TokenKind.Restore,
  // renum: TokenKind.Renum,

  // TODO: variable definitions
  // TODO: control flow
  // TODO: error handling
  // TODO: datetime
  // TODO: array operations
  // TODO: file operations, i/o
  print: TokenKind.Print,
  // TODO: internals
  // TODO: shell operations
  // TODO: clear screen
  // cls: TokenKind.Cls,
  // TODO: prompt, as in SET PROMPT
  // TODO: shell stuff
  // TODO:  events and lifecycle
  // TODO: modules
  // TODO: contexts (with, using)
};

export const EOF = '\0';

//
// TODO: Would regular expressions be faster?
//

const WHITESPACE = new Set('\r\t ');

function isWhitespace(c: string): boolean {
  return WHITESPACE.has(c);
}

const DECIMAL_DIGITS = new Set('0123456789');

function isDecimalDigit(c: string): boolean {
  return DECIMAL_DIGITS.has(c);
}

const HEX_DIGITS = new Set('0123456789abcdefABCDEF');

function isHexDigit(c: string): boolean {
  return HEX_DIGITS.has(c);
}

const OCTAL_DIGITS = new Set('01234567');

function isOctalDigit(c: string): boolean {
  return OCTAL_DIGITS.has(c);
}

const BINARY_DIGITS = new Set('01');

function isBinaryDigit(c: string): boolean {
  return BINARY_DIGITS.has(c);
}

const ALPHA = new Set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

function isAlpha(c: string): boolean {
  return ALPHA.has(c);
}

function isAlphaNumeric(c: string): boolean {
  return isAlpha(c) || isDecimalDigit(c);
}

const ILLEGAL_SHELL_CHARS = new Set('`#$&*()|[]{}:\'"<>?!');

function isIllegalShellChar(c: string): boolean {
  return ILLEGAL_SHELL_CHARS.has(c);
}

const ILLEGAL_TOKEN_BOUNDARY = new Set('\r\t\n ');

function isIllegalTokenBoundary(c: string): boolean {
  return ILLEGAL_TOKEN_BOUNDARY.has(c);
}

/**
 * A scanner. Takes a source string and incrementally provides tokens until
 * the source is exhausted.
 */
export class Scanner {
  private start: number;
  private current: number;
  private row: number;
  private offset: number;

  /**
   * @param source The source string.
   */
  constructor(private source: string) {
    this.start = 0;
    this.current = 0;
    this.row = 1;
    this.offset = 0;
  }

  private get done(): boolean {
    return this.current >= this.source.length;
  }

  private match(expected: string): boolean {
    if (this.done) return false;
    if (this.source[this.current] != expected) return false;
    this.current++;
    return true;
  }

  private peek(): string {
    if (this.done) return EOF;
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return EOF;
    return this.source[this.current + 1];
  }

  private advance(): string {
    return this.source[this.current++];
  }

  private emitToken(kind: TokenKind, value: Value = null): Token {
    const text = this.source.slice(this.start, this.current);
    return {
      kind,
      text,
      value,
      pos: {
        index: this.start,
        row: this.row,
        offsetStart: this.offset,
        offsetEnd: this.offset + (this.current - this.start) - 1,
      },
    };
  }

  scanLine(): Token[] {
    const tokens: Token[] = [];
    let token = this.nextToken();
    let line = '';
    while (
      token.kind !== TokenKind.LineEnding &&
      token.kind !== TokenKind.Eof
    ) {
      line += token.text;
      if (token.kind !== TokenKind.Whitespace) {
        tokens.push(token);
      }
      token = this.nextToken();
    }
    line += token.text;
    tokens.push(token);

    for (let token of tokens) {
      token.line = line;
    }
    return tokens;
  }

  nextToken(): Token {
    this.offset += this.current - this.start;
    this.start = this.current;

    if (this.done) {
      return this.emitToken(TokenKind.Eof);
    }

    const c: string = this.advance();
    switch (c) {
      case '\r':
      case '\t':
      case ' ':
        return this.whitespace();
      case '(':
        return this.emitToken(TokenKind.LParen);
      case ')':
        return this.emitToken(TokenKind.RParen);
      case ',':
        return this.emitToken(TokenKind.Comma);
      case ';':
        return this.emitToken(TokenKind.Semicolon);
      case ':':
        return this.emitToken(TokenKind.Colon);
      case '#':
        return this.emitToken(TokenKind.Hash);
      case '=':
        // TODO: How does equality work?
        return this.emitToken(TokenKind.Equals);
      case '"':
        return this.string('"');
      case "'":
        return this.string("'");
      case '\n':
        const token = this.emitToken(TokenKind.LineEnding);
        this.offset = -1;
        this.row++;
        return token;
      case '0':
        if (this.match('x')) {
          return this.hex();
        } else if (this.match('o')) {
          return this.octal();
        } else if (this.match('b')) {
          return this.binary();
        }
        return this.decimal();
      case '$':
        if (isAlpha(this.peek()) || this.peek() === '_') {
          return this.identifier();
        } else {
          return this.illegal();
        }
      case 'r':
        // Remarks
        if (this.peek() === 'e' && this.peekNext() === 'm') {
          this.advance();
          this.advance();
          if (this.match(' ') || this.match('\t')) {
            while (this.peek() !== '\n' && !this.done) {
              this.advance();
            }

            // The contents of the remark
            const value = this.source
              .slice(this.start + 3, this.current)
              .trim();

            return this.emitToken(TokenKind.Rem, value);
          }
        }
      // Fall through to default handling
      default:
        if (isDecimalDigit(c)) {
          return this.decimal();
        } else if (isAlpha(c) || c === '_') {
          return this.identifier();
        } else if (isIllegalShellChar(c)) {
          return this.illegal();
        } else {
          return this.shell();
        }
    }
  }

  private whitespace(): Token {
    while (isWhitespace(this.peek())) {
      this.advance();
    }
    const value = this.source.slice(this.start, this.current);
    return this.emitToken(TokenKind.Whitespace, value);
  }

  //
  // Various value scanners.
  //

  private string(quoteChar: '"' | "'"): Token {
    let value: string = '';
    while (![quoteChar, '\n', '\r'].includes(this.peek()) && !this.done) {
      const c: string = this.advance();

      if (c === '\\') {
        switch (this.advance()) {
          case 'a':
            value += '\u{07}';
            break;
          case 'b':
            value += '\u{08}';
            break;
          case 't':
            value += '\t';
            break;
          case 'r':
            value += '\r';
            break;
          case 'v':
            value += '\u{0b}';
            break;
          case 'f':
            value += '\u{0c}';
            break;
          case 'n':
            value += '\n';
            break;
          case '\\':
            value += '\\';
            break;
          case quoteChar:
            value += quoteChar;
            break;
          case EOF:
            value += '\\';
            break;
          default:
            // TODO: This should emit a warning.
            value += '\\';
            value += c;
        }
      } else {
        value += c;
      }
    }

    if (this.peek() !== quoteChar) {
      return this.emitToken(TokenKind.UnterminatedStringLiteral, value);
    }

    this.advance();

    return this.emitToken(TokenKind.StringLiteral, value);
  }

  private hex(): Token {
    while ((this.peek() === '_' || isHexDigit(this.peek())) && !this.done) {
      this.advance();
    }
    let value: number;
    try {
      value = parseInt(this.source.slice(this.start + 2, this.current), 16);
    } catch (err) {
      // TODO: This should be a RuntimeFault
      throw err;
    }
    return this.emitToken(TokenKind.HexLiteral, value);
  }

  private octal(): Token {
    while ((this.peek() === '_' || isOctalDigit(this.peek())) && !this.done) {
      this.advance();
    }
    let value: number;
    try {
      value = parseInt(this.source.slice(this.start + 2, this.current), 8);
    } catch (err) {
      // TODO: This should be a RuntimeFault
      throw err;
    }
    return this.emitToken(TokenKind.OctalLiteral, value);
  }

  private binary(): Token {
    while ((this.peek() === '_' || isBinaryDigit(this.peek())) && !this.done) {
      this.advance();
    }
    let value: number;
    try {
      value = parseInt(this.source.slice(this.start + 2, this.current), 16);
    } catch (err) {
      // TODO: This should be a RuntimeFault
      throw err;
    }
    return this.emitToken(TokenKind.BinaryLiteral, value);
  }

  private decimal(): Token {
    let isReal = false;
    while ((this.peek() === '_' || isDecimalDigit(this.peek())) && !this.done) {
      this.advance();
    }

    if (
      this.peek() === '.' &&
      (this.peekNext() === '_' || isDecimalDigit(this.peekNext()))
    ) {
      isReal = true;
      this.advance();
    }

    while ((this.peek() === '_' || isDecimalDigit(this.peek())) && !this.done) {
      this.advance();
    }

    if (
      this.peek() === 'e' &&
      (this.peek() === '_' || isDecimalDigit(this.peekNext()))
    ) {
      isReal = true;
      this.advance();
    }

    while ((this.peek() === '_' || isDecimalDigit(this.peek())) && !this.done) {
      this.advance();
    }

    let value: number;
    try {
      if (isReal) {
        value = parseFloat(this.source.slice(this.start, this.current));
        return this.emitToken(TokenKind.RealLiteral, value);
      }
      value = parseInt(this.source.slice(this.start, this.current), 10);
      return this.emitToken(TokenKind.DecimalLiteral, value);
    } catch (err) {
      // TODO: This should be a RuntimeFault
      throw err;
    }
  }

  // If a token is a valid identifier, we parse it as such. However, if it
  // isn't a valid identifier but doesn't contain illegal characters, we
  // scan it as a shell token.
  //

  private identifier(): Token {
    while (true) {
      const c = this.peek();
      if (isAlphaNumeric(c) || c === '_') {
        this.advance();
      } else {
        break;
      }
    }

    const value = this.source.slice(this.start, this.current);
    let kind: TokenKind;
    if (KEYWORDS[value]) {
      kind = KEYWORDS[value];
    } else if (value.startsWith('$')) {
      kind = TokenKind.StringIdent;
    } else {
      kind = TokenKind.Ident;
    }

    return this.emitToken(kind, value);
  }

  private shell(): Token {
    while (!this.done) {
      const c = this.peek();
      if (isIllegalShellChar(c) || isWhitespace(c)) {
        break;
      }
      this.advance();
    }

    const value = this.source.slice(this.start, this.current);
    return this.emitToken(TokenKind.ShellToken, value);
  }

  private illegal(): Token {
    while (!isIllegalTokenBoundary(this.peek()) && !this.done) {
      this.advance();
    }
    const value = this.source.slice(this.start, this.current);
    return this.emitToken(TokenKind.Illegal, value);
  }
}
