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
  IntLiteral = '<int>',
  RealLiteral = '<real>',
  StringLiteral = '<string>',
  Ident = '<ident>',
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

  LineEnding = '\\n',
  Whitespace = '<whitespace>',
}

// Naively using the keyword lookup technique from Crafting Interpreters at
// the scanner level. It may, however, be more appropriate to implement as
// a combinator.
const KEYWORDS: Record<string, TokenKind> = {
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

const MATCH_SIMPLE: Array<[boolean, RegExp, TokenKind]> = [
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^,/g, TokenKind.Comma],
  [true, /^;/g, TokenKind.Semicolon],
  [true, /^:/g, TokenKind.Colon],
  [true, /^=/g, TokenKind.Equals],
  [true, /^#/g, TokenKind.Hash],
  // TODO: integer literal
  // TODO: real literal
  // TODO: string literal
  // TODO: command literal
  // TODO: path literal
  // TODO: rem
];

const MATCH_KEYWORD: Array<[boolean, RegExp, TokenKind]> = Object.entries(
  KEYWORDS,
).map(([kw, kind]): [boolean, RegExp, TokenKind] => {
  return [true, new RegExp(`^${kw}`, 'g'), kind];
});

const MATCH_IDENT: Array<[boolean, RegExp, TokenKind]> = [];
const MATCH_WHITESPACE: Array<[boolean, RegExp, TokenKind]> = [
  // TODO: significant newlines
  [true, /^\n+/g, TokenKind.LineEnding],
  [false, /^\s+/g, TokenKind.Whitespace],
];

export const scanner: Lexer<TokenKind> = buildLexer(
  MATCH_SIMPLE.concat(MATCH_KEYWORD)
    .concat(MATCH_IDENT)
    .concat(MATCH_WHITESPACE),
);
