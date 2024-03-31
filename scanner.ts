import {
  buildLexer,
  Lexer,
  Parser,
  ParserOutput,
  Token,
  TokenError,
  unableToConsumeToken,
} from 'typescript-parsec';

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

  True = 'TRUE',
  False = 'FALSE',

  StringLiteral = '<string>',

  Ident = '<ident>',
  StringIdent = '<string ident>',

  PathLiteral = '<path>',
  CommandLiteral = '<command>',

  New = 'NEW',
  Load = 'LOAD',
  Save = 'SAVE',
  List = 'LIST',
  Run = 'RUN',
  End = 'END',

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

  Print = 'PRINT',

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

  Rem = '<rem>',
  LineEnding = '\\n',
  Whitespace = '<whitespace>',
}

// Naively using the keyword lookup technique from Crafting Interpreters at
// the scanner level. It may, however, be more appropriate to implement as
// a combinator.
export const KEYWORDS: Record<string, TokenKind> = {
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

  // variable definitions
  let: TokenKind.Let,
  data: TokenKind.Data,
  def: TokenKind.Def,
  fn: TokenKind.Fn,
  // usr: TokenKind.Usr,
  defint: TokenKind.DefInt,
  // defsng: TokenKind.DefSng,
  defdbl: TokenKind.DefDbl,
  defstr: TokenKind.DefStr,
  dim: TokenKind.Dim,
  // get: TokenKind.Get,
  // set: TokenKind.Set,
  // put: TokenKind.Put,
  // on: TokenKind.On,
  // off: TokenKind.Off,
  // stop: TokenKind.Stop,

  // control flow
  for: TokenKind.For,
  to: TokenKind.To,
  step: TokenKind.Step,
  gosub: TokenKind.GoSub,
  goto: TokenKind.GoTo,
  return: TokenKind.Return,
  if: TokenKind.If,
  then: TokenKind.Then,
  else: TokenKind.Else,
  next: TokenKind.Next,
  while: TokenKind.While,

  // error handling
  erl: TokenKind.Erl,
  err: TokenKind.Err,
  error: TokenKind.Error,
  resume: TokenKind.Resume,

  // datetime
  date: TokenKind.Date,
  time: TokenKind.Time,

  // array operations
  len: TokenKind.Len,

  // file operations, i/o
  print: TokenKind.Print,
  // log: TokenKind.Log,
  // open: TokenKind.Open,
  // close: TokenKind.Close,
  // input: TokenKind.Input,
  // eof: TokenKind.Eof,
  // read: TokenKind.Read,
  // write: TokenKind.Write,

  // internals
  // peek: TokenKind.Peek,
  // poke: TokenKind.Poke,
  // system: TokenKind.System,
  // process: TokenKind.Process

  // shell operations
  // clear screen
  cls: TokenKind.Cls,
  // as in SET PROMPT
  // prompt: TokenKind.Prompt,
  cd: TokenKind.Cd,
  cp: TokenKind.Cp,
  rm: TokenKind.Rm,
  touch: TokenKind.Touch,
  mv: TokenKind.Mv,
  mkdir: TokenKind.MkDir,
  rmdir: TokenKind.RmDir,
  pwd: TokenKind.Pwd,
  export: TokenKind.Export,
  // spawn: TokenKind.Spawn,
  // kill: TokenKind.Kill,
  // job: TokenKind.Job,

  // events and lifecycle
  // interval: TokenKind.Interval,
  // timeout: TokenKind.Timeout,
  // start: TokenKind.Start,
  // key: TokenKind.Key,
  // wait: TokenKind.Wait,

  // modules
  // import: TokenKind.Import

  // contexts, etc
  // with: TokenKind.With,
  // using: TokenKind.Using,
};

const MATCH_PUNCTUATION: Array<[boolean, RegExp, TokenKind]> = [
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^,/g, TokenKind.Comma],
  [true, /^;/g, TokenKind.Semicolon],
  [true, /^:/g, TokenKind.Colon],
  [true, /^=/g, TokenKind.Equals],
  [true, /^#/g, TokenKind.Hash],
];

const MATCH_KEYWORD: Array<[boolean, RegExp, TokenKind]> = Object.entries(
  KEYWORDS,
).map(([kw, kind]): [boolean, RegExp, TokenKind] => {
  return [true, new RegExp(`^${kw}`, 'g'), kind];
});

// TODO: command literal - either generate from the PATH or regexp anything
// that could plausibly be a command

// TODO: -o/--option

// TODO: path literals

//
// Strings are scanned as literals, quotes and all. They will be parsed
// later, probably with something hand-rolled. rs/strings.rs includes a
// list of escape characters used by visual basic.
//

const DOUBLE_QUOTE_RE = /^"([^"|\\]|\\.)*"/g;
const SINGLE_QUOTE_RE = /^'([^'|\\]|\\.)*'/g;

const MATCH_STRING: Array<[boolean, RegExp, TokenKind]> = [
  [true, DOUBLE_QUOTE_RE, TokenKind.StringLiteral],
  [true, SINGLE_QUOTE_RE, TokenKind.StringLiteral],
];

//
// Numbers are also scanned as literals, but there are different kinds for
// each type of number.
//
// I haven't fully thought through the design of these yet, and I suspect the
// regexps could be more strict in their input.
//

const DECIMAL_RE = /^[\d_]+/g;
const HEX_RE = /^0x[\da-fA-F_]+/g;
const OCTAL_RE = /^0o[0-7_]+/g;
const BINARY_RE = /^0b[01_]+/g;

const REAL_RE = /^[\d_]+\.[\d_]*(e[\d_]+)?/g;

const MATCH_NUMBER: Array<[boolean, RegExp, TokenKind]> = [
  [true, DECIMAL_RE, TokenKind.DecimalLiteral],
  [true, HEX_RE, TokenKind.HexLiteral],
  [true, OCTAL_RE, TokenKind.OctalLiteral],
  [true, BINARY_RE, TokenKind.BinaryLiteral],
  [true, REAL_RE, TokenKind.RealLiteral],
];

const MATCH_BOOL: Array<[boolean, RegExp, TokenKind]> = [
  [true, /^true/g, TokenKind.True],
  [true, /^false/g, TokenKind.False],
];

//
// Identifiers. Remember, strings are marked with a $ prefix.
//
// In the future, I plan for most identifiers to be manifest.
//

const IDENT_RE_STR = '[a-zA-Z_][a-zA-Z0-9_]*';
const IDENT_RE = new RegExp(`^${IDENT_RE_STR}`, 'g');
const STR_IDENT_RE = new RegExp(`^\\$${IDENT_RE_STR}`, 'g');

const MATCH_IDENT: Array<[boolean, RegExp, TokenKind]> = [
  [true, IDENT_RE, TokenKind.Ident],
  [true, STR_IDENT_RE, TokenKind.StringIdent],
];

//
// Remarks are anything after 'rem' until the end of a line. At parse time,
// we can just slice off the 'rem'.
//
const MATCH_REM: Array<[boolean, RegExp, TokenKind]> = [
  [true, /^rem$/g, TokenKind.Rem],
  [true, /^rem(?=\n)/g, TokenKind.Rem],
  [true, /^rem\W+[^\n]*/g, TokenKind.Rem],
];

const MATCH_WHITESPACE: Array<[boolean, RegExp, TokenKind]> = [
  // TODO: significant newlines, if any
  [true, /^\n+/g, TokenKind.LineEnding],
  [false, /^\s+/g, TokenKind.Whitespace],
];

export const scanner: Lexer<TokenKind> = buildLexer(
  MATCH_PUNCTUATION.concat(MATCH_STRING)
    .concat(MATCH_NUMBER)
    .concat(MATCH_KEYWORD)
    .concat(MATCH_BOOL)
    .concat(MATCH_IDENT)
    .concat(MATCH_REM)
    .concat(MATCH_WHITESPACE),
);
