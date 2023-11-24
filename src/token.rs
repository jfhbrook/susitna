
pub type Double = f64;
pub type Integer = i64;

pub struct Symbol {
    pub identifier: Vec<String>
}

// TODO: yabasic supports three kinds of digits: base 10 Digits, base 16
// HexDigits, and binary BinDigits. Right now, I'm parsing those to a string,
// but I think I want to lex these into i64s.
pub struct Digits {
    pub digits: String
}

pub type Docu = String;

#[derive(PartialEq, Debug, Clone)]
pub enum Value {
    // Unambiguously have a value associated with them
    Num(f64),
    // NOTE: yabasic uses digits to represent booleans; I'm using a dedicated
    // type.
    Bool(bool),
    Symbol(Symbol),
    StrSym(Symbol),
    Docu(String),
    Digits(Digits),
    HexDigits(Digits),
    BinDigits(Digits),
    String(String),

    // In yabasic, don't have a value associated with them
    For,
    To,
    Step,
    Next,
    While,
    WEnd,
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
    Endsub,
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
    Send,
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
    Endif,
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
    Colour,
    BackColour,

    And,
    Or,
    Not,
    BitNot,
    Eor,
    Shl,
    Shr,

    Neq,
    Leq,
    Geq,
    Ltn,
    Gtn,
    Equ,
    Equ2,
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
    TokenAlt,
    Split,
    SplitAlt,
    Glob,

    StartProgram,
    StartExpression,
    StartStringExpression,
    StartAssignment,
    StartFunctionDefinition,

    Eval2,

    // These are represented as individual characters in yabasic
    Subtract, // '-'
    Add,      // '+'
    Multiply, // '*'
    Divide,   // '/'
    Neg,      // UMINUS
    LParen,   // '('
    RParen,   // ')'
}
