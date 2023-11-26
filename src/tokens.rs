use nom::{InputIter, InputLength, InputTake, Needed, Slice};
use nom_locate::LocatedSpan;
use std::iter::Enumerate;
use std::ops::{Range, RangeFrom, RangeFull, RangeTo};

// TODO: let's implement a Tokens collection type. I can basically copy what
// monkey-rust does here - make a struct that wraps Vec<LocatedToken> and
// implement all the traits it says to implement. This will be a data structure
// I can hand to the parser code later on.

pub type Span<'a> = LocatedSpan<&'a str>;

#[derive(PartialEq, Debug, Clone)]
pub struct LocatedToken<'a> {
    pub token: Token,
    pub position: Span<'a>,
}

// A symbol - a variable, an import path, etc
#[derive(PartialEq, Debug, Clone)]
pub struct Symbol {
    pub identifier: Vec<String>,
}

impl Symbol {
    pub fn new(identifier: Vec<String>) -> Symbol {
        Symbol { identifier }
    }
}

#[derive(PartialEq, Debug, Clone)]
pub enum Token {
    // Unambiguously have a value associated with them
    Num(f64),
    // NOTE: yabasic uses digits to represent booleans; I'm using a dedicated
    // type.
    Bool(bool),
    Symbol(Symbol),
    StrSym(Symbol),
    Docu(String),
    Digits(i64),
    HexDigits(i64),
    BinDigits(i64),
    LineNo(u16),
    String(String),

    // In yabasic, don't have a value associated with them
    For,
    To,
    Step,
    Next,
    While,
    EndWhile,
    Repeat,
    Until,
    // NOTE: yabasic loads the library as a side effect of lexing, but in
    // our case we hold onto the name for loading later
    Import(Symbol),

    Goto,
    Gosub,
    Label,
    On,
    Sub,
    EndSub,
    Local,
    Static,
    Export,
    Error,

    Execute,
    Execute2,
    Compile,
    RuntimeCreatedSub,

    Interrupt,
    Break,
    Continue,
    Switch,
    EndSwitch,
    Case,
    Default,
    Loop,
    Do,

    // NOTE: in yabasic, separators include a bunch of things - including
    // comments - and interprets whether they have special meaning at
    // tokenization. here, I'm using multiple token types for each kind of
    // separator-like thing, with Sep being a default for now, and potentially
    // "colon" later
    Sep,
    DoubleLineEnding,
    SingleLineEnding,
    // comments that use the REM keyword - cause an implicit endif
    Rem(String),
    // non-REM comments.
    // TODO: do I want to support these? or just REM?
    Comment(String),

    // NOTE: yabasic uses this token to switch between loading mode
    // and runtime eval mode. I probably don't need it.
    EoProg,

    If,
    Then,
    Else,
    Elsif,
    EndIf,
    // NOTE: yabasic detects this at the lexing layer, we should be able to
    // capture this with a combinator and avoid a dedicated token type
    ImplicitEndif,
    Using,

    Print,
    Input,
    Return,
    Dim,
    End,
    Exit,
    At,
    Screen,

    Reverse,
    Color,
    BackColor,

    And,
    Or,
    Not,
    BitNot,
    EOr,
    XOr,
    Shl,
    Shr,

    Ne,
    Le,
    Ge,
    Lt,
    Gt,
    Eq,
    Eq2,
    Pow,

    Read,
    Data,
    Restore,

    Open,
    Close,
    Seek,
    Tell,
    As,
    Reading,
    Writing,
    Origin,

    Window,
    Dot,
    Line,
    Circle,
    Triangle,
    Text,
    Clear,
    Fill,
    Printer,

    Wait,
    Bell,
    Let,
    ArDim,
    ArSize,
    Bind,

    Rect,
    GetBit,
    PutBit,
    GetChar,
    PutChar,
    New,
    Curve,

    Sin,
    Asin,
    Cos,
    Acos,
    Tan,
    Atan,
    Exp,
    Log,

    Sqrt,
    Sqr,
    MyEof,
    Abs,
    Sig,

    Int,
    Ceil,
    Floor,
    Frac,
    Round,
    Mod,
    Ran,
    Val,
    Left,
    Right,
    Mid,
    Len,
    Min,
    Max,

    Str,
    InKey,
    Chr,
    Asc,
    Hex,
    Dec,
    Bin,
    Upper,
    Lower,
    MouseX,
    MouseY,
    MouseB,
    MouseMod,

    Trim,
    Ltrim,
    Rtrim,
    Instr,
    RInstr,
    Chomp,

    System,
    System2,
    Peek,
    Peek2,
    Poke,
    FrnfnCall,
    FrnfnCall2,
    FrnfnSize,

    FrnbfAlloc,
    FrnbfFree,
    FrnbfSize,
    FrnbfDump,
    FrnbfSet,
    FrnbfGet,
    FrnbfGet2,

    FrnbfGetBuffer,
    FrnbfSetBuffer,

    Date,
    Time,
    Token,
    Token2,
    Split,
    Split2,
    Glob,

    StartProgram,
    StartExpression,
    StartStringExpression,
    StartAssignment,
    StartFunctionDefinition,

    Eval,
    Eval2,

    // These are represented as individual characters in yabasic
    Subtract, // '-'
    Add,      // '+'
    Multiply, // '*'
    Divide,   // '/'
    // Colon,     // ':'
    LParen,    // '('
    RParen,    // ')'
    Comma,     // ','
    Period,    // '.'
    Semicolon, // ';'

    // Illegal tokens. yabasic doesn't have this, but monkey-lang does, and
    // I think it will help with debugging.
    Illegal(String),
}

// A data structure for collections of tokens. Borrows VERY heavily from:
//
//     https://github.com/Rydgel/monkey-rust/blob/master/lib/lexer/token.rs
//
// TODO: This is using a lot of odd tricks, namely representing Tokens with
// a C style memory layout. I'm keeping that stuff here for now, because I
// don't know what's strictly necessary to keep nom happy. But once I have a
// working parser, I'd like to start deleting stuff until it stops working.

#[derive(Clone, Copy, PartialEq, Debug)]
#[repr(C)]
pub struct Tokens<'a> {
    pub tokens: &'a [LocatedToken<'a>],
    pub start: usize,
    pub end: usize,
}

impl<'a> Tokens<'a> {
    pub fn new(vec: &'a [LocatedToken<'a>]) -> Self {
        Tokens {
            tokens: vec,
            start: 0,
            end: vec.len(),
        }
    }
}

impl<'a> InputLength for Tokens<'a> {
    #[inline]
    fn input_len(&self) -> usize {
        self.tokens.len()
    }
}

impl<'a> InputTake for Tokens<'a> {
    #[inline]
    fn take(&self, count: usize) -> Self {
        Tokens {
            tokens: &self.tokens[0..count],
            start: 0,
            end: count,
        }
    }

    #[inline]
    fn take_split(&self, count: usize) -> (Self, Self) {
        let (prefix, suffix) = self.tokens.split_at(count);
        let first = Tokens {
            tokens: prefix,
            start: 0,
            end: prefix.len(),
        };
        let second = Tokens {
            tokens: suffix,
            start: 0,
            end: suffix.len(),
        };
        (second, first)
    }
}

impl InputLength for LocatedToken<'_> {
    #[inline]
    fn input_len(&self) -> usize {
        1
    }
}

impl<'a> Slice<Range<usize>> for Tokens<'a> {
    #[inline]
    fn slice(&self, range: Range<usize>) -> Self {
        Tokens {
            tokens: self.tokens.slice(range.clone()),
            start: self.start + range.start,
            end: self.start + range.end,
        }
    }
}

impl<'a> Slice<RangeTo<usize>> for Tokens<'a> {
    #[inline]
    fn slice(&self, range: RangeTo<usize>) -> Self {
        self.slice(0..range.end)
    }
}

impl<'a> Slice<RangeFrom<usize>> for Tokens<'a> {
    #[inline]
    fn slice(&self, range: RangeFrom<usize>) -> Self {
        self.slice(range.start..self.end - self.start)
    }
}

impl<'a> Slice<RangeFull> for Tokens<'a> {
    #[inline]
    fn slice(&self, _: RangeFull) -> Self {
        Tokens {
            tokens: self.tokens,
            start: self.start,
            end: self.end,
        }
    }
}

impl<'a> InputIter for Tokens<'a> {
    type Item = &'a LocatedToken<'a>;
    type Iter = Enumerate<::std::slice::Iter<'a, LocatedToken<'a>>>;
    type IterElem = ::std::slice::Iter<'a, LocatedToken<'a>>;

    #[inline]
    fn iter_indices(&self) -> Enumerate<::std::slice::Iter<'a, LocatedToken<'a>>> {
        self.tokens.iter().enumerate()
    }
    #[inline]
    fn iter_elements(&self) -> ::std::slice::Iter<'a, LocatedToken<'a>> {
        self.tokens.iter()
    }
    #[inline]
    fn position<P>(&self, predicate: P) -> Option<usize>
    where
        P: Fn(Self::Item) -> bool,
    {
        self.tokens.iter().position(predicate)
    }
    #[inline]
    fn slice_index(&self, count: usize) -> Result<usize, Needed> {
        if self.tokens.len() >= count {
            Ok(count)
        } else {
            Err(Needed::Unknown)
        }
    }
}
