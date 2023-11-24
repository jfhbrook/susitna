// This file will contain the lexer - ie, functions for taking &str input and
// converting it into a collection of Tokens. The parser will then convert
// those tokens into expressions, statements, and so on.
//
// Third, I'll need to look at the syntax! macro from monkey-rust. Their macro
// helps simplify writing parsers for "simple" tokens. Of course, MY token
// parsing is less simple because tokens can involve case insensitivity and
// arbitrary whitespace. But it should be a good starting place, and even if
// I can't make it handle those use cases it should still be able to handle
// the simplest of tokens. I have a LOT of tokens so it should help with
// boilerplate.
//
// Once I have that macro, I should be able to bang out all the "simple"
// token parsers.
//
// Fourth, I'll need to actually port over the parsers I've already written
// in yabasic-rs.
//
// Fifth, let's implement a Tokens collection type. I can basically copy what
// monkey-rust does here - make a struct that wraps Vec<LocatedToken> and
// implement all the traits it says to implement. This will be a data structure
// I can hand to the parser code later on.
//
// Sixth, I'll want to put it all together. monkey-rust has good examples to
// follow here, but basically any given input will be some whitespace, plus
// tokens separated by potential whitespace, plus trailing whitespace. At
// this stage, I can take a given token and use nom_locate to track its
// position in a LocatedSpan.
//
// Finally, monkey-rust has an "illegal" token type, and I think that will
// help with error reporting at the parser level. Now might be a good time to
// implement that.
//
// If I get this far, I should be ready to tackle the parser!

use crate::tokens::{Span, Token};
use nom::{
    branch::alt,
    bytes::complete::{tag, tag_no_case},
    character::complete::space0,
    combinator::map,
    sequence::tuple,
    IResult,
};

// TODO: This is the name monkey-rust gives this type of macro. I don't really
// like the name - maybe workshop it a bit?
macro_rules! syntax {
    ($func_name: ident, $tag_string: literal, $output_token: expr) => {
        fn $func_name<'a>(s: Span<'a>) -> IResult<Span<'a>, Token> {
            map(tag_no_case($tag_string), |_| $output_token)(s)
        }
    };
    ($func_name: ident, $parser: expr, $output_token: expr) => {
        fn $func_name<'a>(s: Span<'a>) -> IResult<Span<'a>, Token> {
            map($parser, |_| $output_token)(s)
        }
    };
}

syntax!(execute, "EXECUTE", Token::Execute);
syntax!(execute2, "EXECUTE$", Token::Execute2);
syntax!(compile, "COMPILE", Token::Compile);
syntax!(eval, "EVAL", Token::Eval);
syntax!(eval2, "EVAL$", Token::Eval2);
syntax!(
    runtime_created_sub,
    "RUNTIME_CREATED_SUB",
    Token::RuntimeCreatedSub
);
syntax!(
    end_sub,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("SUB")
    )),
    Token::EndSub
);
syntax!(
    end_if,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("IF")
    )),
    Token::EndIf
);
// TODO: ick
syntax!(fi, "FI", Token::EndIf);
syntax!(
    end_while,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("WHILE")
    )),
    Token::EndWhile
);
// TODO: ick
syntax!(wend, "WEND", Token::EndWhile);
syntax!(
    end_switch,
    tuple((
        tag_no_case("END"),
        alt((space0, tag("-"))),
        tag_no_case("SWITCH")
    )),
    Token::EndSwitch
);
syntax!(export, "EXPORT", Token::Export);
syntax!(error, "ERROR", Token::Error);
syntax!(for_, "FOR", Token::For);
syntax!(break_, "BREAK", Token::Break);
syntax!(switch, "SWITCH", Token::Switch);
syntax!(case, "CASE", Token::Case);
syntax!(default, "DEFAULT", Token::Default);
syntax!(loop_, "LOOP", Token::Loop);
syntax!(do_, "DO", Token::Do);
syntax!(to, "TO", Token::To);
syntax!(as_, "AS", Token::As);
syntax!(reading, "READING", Token::Reading);
syntax!(writing, "WRITING", Token::Writing);
syntax!(step, "STEP", Token::Step);
syntax!(next, "NEXT", Token::Next);
syntax!(while_, "WHILE", Token::While);
syntax!(repeat, "REPEAT", Token::Repeat);
syntax!(until, "UNTIL", Token::Until);
syntax!(goto, "GOTO", Token::Goto);
syntax!(gosub, "GOSUB", Token::Gosub);
syntax!(
    sub,
    alt((tag_no_case("SUBROUTINE"), tag_no_case("SUB"))),
    Token::Sub
);
syntax!(local, "LOCAL", Token::Local);
syntax!(static_, "STATIC", Token::Static);
syntax!(on, "ON", Token::On);
syntax!(interrupt, "INTERRUPT", Token::Interrupt);
syntax!(continue_, "CONTINUE", Token::Continue);
syntax!(label, "LABEL", Token::Label);
syntax!(if_, "IF", Token::If);
syntax!(then_, "THEN", Token::Then);
syntax!(else_, "ELSE", Token::Else);
syntax!(
    elsif,
    alt((tag_no_case("ELSIF"), tag_no_case("ELSEIF"))),
    Token::Elsif
);
syntax!(open, "OPEN", Token::Open);
syntax!(close, "CLOSE", Token::Close);
syntax!(seek, "SEEK", Token::Seek);
syntax!(tell, "TELL", Token::Tell);
// TODO: ick
syntax!(print, alt((tag_no_case("PRINT"), tag("\\?"))), Token::Print);
syntax!(using, "USING", Token::Using);
syntax!(reverse, "REVERSE", Token::Reverse);
syntax!(
    color,
    alt((tag_no_case("COLOR"), tag_no_case("COLOUR"))),
    Token::Color
);
syntax!(
    backcolor,
    alt((tag_no_case("BACKCOLOR"), tag_no_case("BACKCOLOUR"))),
    Token::BackColor
);
syntax!(input, "INPUT", Token::Input);
syntax!(return_, "RETURN", Token::Return);
// TODO: what is REDIM?
syntax!(
    dim,
    alt((tag_no_case("DIM"), tag_no_case("REDIM"))),
    Token::Dim
);
// NOTE: This must come AFTER other end-ish lexers
syntax!(end, "END", Token::End);
syntax!(exit, "EXIT", Token::Exit);
syntax!(read, "READ", Token::Read);
syntax!(data, "DATA", Token::Data);
syntax!(restore, "RESTORE", Token::Restore);
syntax!(and, "AND", Token::And);
syntax!(or, "OR", Token::Or);
syntax!(not, "NOT", Token::Not);
// TODO: Can I use more C-like syntax for bitwise not?
syntax!(bitnot, "BITNOT", Token::BitNot);
syntax!(eor, "EOR", Token::EOr);
syntax!(xor, "XOR", Token::XOr);
// TODO: What are these? lol
syntax!(shl, "SHL", Token::Shl);
syntax!(shr, "SHR", Token::Shr);
syntax!(window, "WINDOW", Token::Window);
syntax!(origin, "ORIGIN", Token::Origin);
syntax!(printer, "PRINTER", Token::Printer);
syntax!(dot, "DOT", Token::Dot);
syntax!(line, "LINE", Token::Line);
syntax!(curve, "CURVE", Token::Curve);
syntax!(circle, "CIRCLE", Token::Circle);
syntax!(triangle, "TRIANGLE", Token::Triangle);
syntax!(clear, "CLEAR", Token::Clear);
syntax!(
    fill,
    alt((tag_no_case("FILLED"), tag_no_case("FILL"))),
    Token::Fill
);
syntax!(text, "TEXT", Token::Text);
// TODO: This is an entirely unreasonable number of ways to spell these lmao
syntax!(
    rectangle,
    alt((
        tag_no_case("RECTANGLE"),
        tag_no_case("RECT"),
        tag_no_case("BOX")
    )),
    Token::Rect
);
syntax!(
    put_bit,
    alt((
        tag_no_case("BITBLIT"),
        tag_no_case("BITBLT"),
        tag_no_case("PUTBIT")
    )),
    Token::PutBit
);
syntax!(
    get_bit,
    alt((
        tag_no_case("BITBLIT$"),
        tag_no_case("BITBLT$"),
        tag_no_case("GETBIT$")
    )),
    Token::GetBit
);
syntax!(putchar, "PUTSCREEN", Token::PutChar);
syntax!(getchar, "GETSCREEN$", Token::GetChar);
syntax!(new, "NEW", Token::New);
syntax!(
    wait,
    alt((
        tag_no_case("WAIT"),
        tag_no_case("PAUSE"),
        tag_no_case("SLEEP")
    )),
    Token::Wait
);
syntax!(
    bell,
    alt((tag_no_case("BELL"), tag_no_case("BEEP"))),
    Token::Bell
);
syntax!(let_, "LET", Token::Let);
syntax!(
    ardim,
    alt((
        tag_no_case("ARRAYDIMENSION"),
        tag_no_case("ARRAYDIM"),
        tag_no_case("ARRAYSIZE")
    )),
    Token::ArDim
);
// TODO: NUMPARAM/NUMPARAMS
syntax!(bind, "BIND", Token::Bind);

// TODO: Should these be functions?
syntax!(sin, "SIN", Token::Sin);
syntax!(asin, "ASIN", Token::Asin);
syntax!(cos, "COS", Token::Cos);
syntax!(acos, "ACOS", Token::Acos);
syntax!(tan, "TAN", Token::Tan);
syntax!(atan, "ATAN", Token::Atan);
syntax!(exp, "EXP", Token::Exp);
syntax!(log, "LOG", Token::Log);
syntax!(sqrt, "SQRT", Token::Sqrt);
syntax!(sqr, "SQR", Token::Sqr);
syntax!(int, "INT", Token::Int);
syntax!(ceil, "CEIL", Token::Ceil);
syntax!(floor, "FLOOR", Token::Floor);
syntax!(round, "ROUND", Token::Round);
syntax!(frac, "FRAC", Token::Frac);
syntax!(abs, "ABS", Token::Abs);
syntax!(sig, "SIG", Token::Sig);
syntax!(mod_, "MOD", Token::Mod);
// TODO: Random?
syntax!(ran, "RAN", Token::Ran);
syntax!(min, "MIN", Token::Min);
syntax!(max, "MAX", Token::Max);
syntax!(left, "LEFT$", Token::Left);
syntax!(right, "RIGHT$", Token::Right);
syntax!(mid, "MID$", Token::Mid);
syntax!(lower, "LOWER$", Token::Lower);
syntax!(upper, "UPPER$", Token::Upper);
syntax!(ltrim, "LTRIM$", Token::Ltrim);
syntax!(rtrim, "RTRIM$", Token::Rtrim);
syntax!(trim, "TRIM$", Token::Trim);
syntax!(instr, "INSTR", Token::Instr);
syntax!(rinstr, "RINSTR", Token::RInstr);
syntax!(chomp, "CHOMP$", Token::Chomp);
syntax!(len, "LEN", Token::Len);
syntax!(val, "VAL", Token::Val);
// TODO: This is not a good name for this lol
syntax!(my_eof, "EOF", Token::MyEof);
syntax!(str_, "STR$", Token::Str);
syntax!(inkey, "INKEY$", Token::InKey);
syntax!(mousex, "MOUSEX", Token::MouseX);
syntax!(mousey, "MOUSEY", Token::MouseY);

// TODO: Finish banging out all the basic syntax matchers - whew!
