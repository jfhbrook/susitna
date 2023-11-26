// yabasic implements "native functions" in here.

// NOTE: yabasic uses a FIRST_FUNCTION and LAST_FUNCTION to mark beginning
// and end of lists - those are omitted here, since we should have Vecs
// TODO: "sorted by number of arguments" - why is that important? should these
// have their arguments as enum parameters?
pub enum Function {
    // TODO: why are these special?
    Ran2,
    Date,
    Time,

    // "foreign function", "foreign buffer"
    FrnfnCall,
    FrnfnCall2,
    FrnbfAlloc,
    FrnbfDump,
    FrnbfDump2,

    FrnbfGetNumber,
    FrnbfGetString,
    FrnbfGetBuffer,
    FrnfnSize,
    FrnbfSize,

    // zero args
    InKey,
    MouseX,
    MouseY,
    MouseB,
    MouseMod,

    Sin,
    Asin,
    Cos,
    Acos,
    Tan,

    Atan,
    System,
    System2,
    Peek,
    Peek2,
    Peek4,
    Tell,
    Exp,
    Log,
    Len,

    Str,
    Str4,

    Srqt,
    Sqr,
    Frac,
    Round,
    Abs,
    Sig,
    Ran,
    Int,
    Ceil,
    Floor,
    Val,
    Asc,
    Hex,
    Bin,
    Dec,

    Upper,
    Lower,
    Chomp,

    LTrim,
    RTrim,
    Trim,
    Chr,
    BitNot,

    // one arg
    Dec2,
    Atan2,
    Left,
    And,
    Or,

    EOr,
    Shl,
    Shr,
    LogZ,

    Right,
    InStr,
    RInStr,
    Str2,
    Mod,
    Min,
    Max,
    Peek3,
    Mid2,

    // two args
    Mid,
    InStr2,
    RInStr2,
    Str3,

    // three args
    GetBit,
    GetChar,
}
