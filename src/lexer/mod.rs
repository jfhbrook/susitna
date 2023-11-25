// This file will contain the lexer - ie, functions for taking &str input and
// converting it into a collection of Tokens. The parser will then convert
// those tokens into expressions, statements, and so on.
//
// TODO: Bang out the rest of the "simple" syntax parsers.
// TODO: Implement string literals
//
// TODO: put it all together. monkey-rust has good examples to
// follow here, but basically any given input will be some whitespace, plus
// tokens separated by potential whitespace, plus trailing whitespace. At
// this stage, I can take a given token and use nom_locate to track its
// position in a LocatedSpan.
//
// TODO: monkey-rust has an "illegal" token type, and I think that will
// help with error reporting at the parser level. Now might be a good time to
// implement that.
//
// If I get this far, I should be ready to tackle the parser!

use nom::{
    branch::alt,
    bytes::complete::{tag, tag_no_case, take_while},
    character::complete::{anychar, digit1, hex_digit1, line_ending, one_of, space0, space1},
    character::{is_alphabetic, is_alphanumeric},
    combinator::{map, opt, peek, recognize},
    multi::{many1, many_till, separated_list1},
    number::complete::double,
    sequence::{pair, preceded, terminated, tuple},
    IResult,
};

mod strings;

use crate::strings::string_literal;
use crate::tokens::{Digits, Span, Symbol, Token};

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

pub fn name(input: Span) -> IResult<Span, Symbol> {
    // first character can't be a number
    let starts_with = take_while(|c: char| is_alphabetic(c as u8) || c == '_');
    // subsequent characters CAN include numbers
    let followed_by = take_while(|c: char| is_alphanumeric(c as u8) || c == '_');

    let simple_name = map(recognize(pair(starts_with, followed_by)), |n: Span| {
        n.fragment().to_string()
    });

    map(separated_list1(tag("."), simple_name), |names| {
        Symbol::new(names)
    })(input)
}

// TODO: yabasic's parser matches line_no in compile mode and uses state to
// trigger loading a separator and potentially a number for the next two
// tokens. my plan is to match these at the parser level, something like
// pair(line_no, alt((single_newline, preceded(space0, alt((eval_digits, etc)))))).
//
// NOTE: the "cond" combinator might let us use flags to generate parsers
pub fn line_no(input: Span) -> IResult<Span, Token> {
    map(preceded(space1, digit1), |digit: Span| {
        Token::Digits(Digits::from(digit))
    })(input)
}

// kinds of significant whitespace

// used specifically to end loading in interactive mode
syntax!(
    double_line_ending,
    pair(line_ending, line_ending),
    Token::DoubleLineEnding
);
syntax!(single_line_ending, line_ending, Token::SingleLineEnding);
syntax!(colon, ":", Token::Sep);

// TODO: Fix type disaster going on in here
fn rem(input: Span) -> IResult<Span, Token> {
    preceded(
        tag_no_case("REM"),
        alt((
            map(recognize(pair(space1, until_line_ending)), |rem: Span| {
                let mut rem = rem.fragment().to_string();
                // first space is significant whitespace
                rem.remove(0);
                Token::Rem(rem)
            }),
            map(peek(line_ending), |_: Span| Token::Rem(String::new())),
        )),
    )(input)
}

// slash-style comments
fn comment(input: Span) -> IResult<Span, Token> {
    map(
        preceded(alt((tag("//"), tag("#"), tag("'"))), until_line_ending),
        |comment: Span| Token::Comment(comment.fragment().to_string()),
    )(input)
}

syntax!(
    sep,
    alt((double_line_ending, single_line_ending, colon, rem, comment)),
    Token::Sep
);

// NOTE: match kinds of whitespace that would constitute an implicit endif,
// to be used in an if statement parser
pub fn implicit_endif(input: Span) -> IResult<Span, Token> {
    alt((
        double_line_ending,
        single_line_ending,
        // NOTE: yabasic emits a Sep in all rem cases, but only treats a REM
        // *without* a comment as an implicit endif. This is probably a bug.
        rem,
    ))(input)
}

// Used to get everything until the end of the line. We take pains not to
// consume \n or \r\n so that those are parsed as separators.
fn until_line_ending(input: Span) -> IResult<Span, Span> {
    // TODO: test for happy path
    // TODO: test for immediate line ending
    // TODO: how to handle end-of-input?
    //   - assume input is complete and read rest
    //   - return incomplete and wait for a line ending
    //   - might be able to use flags w/ cond
    //   - may be most straightforward with a stateful Vec<Token> parser
    recognize(many_till(opt(anychar), line_ending))(input)
}

// NOTE: yabasic emits three tokens for this: a Label, a Symbol and a Sep. In
// our case, we emit a single Import token.
fn import(input: Span) -> IResult<Span, Token> {
    // NOTE: yabasic either consumes a newline or injects a separator after
    // matching an import statement
    map(
        preceded(pair(tag_no_case("import"), space1), name),
        |name| Token::Import(name),
    )(input)
}

fn docu(input: Span) -> IResult<Span, Token> {
    map(
        preceded(
            pair(
                alt((
                    tag_no_case("DOCU"),
                    tag_no_case("DOC"),
                    tag_no_case("DOCUMENTATION"),
                )),
                space1,
            ),
            until_line_ending,
        ),
        |docu| Token::Docu(docu.fragment().to_string()),
    )(input)
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
fn numparam(input: Span) -> IResult<Span, Token> {
    map(
        tuple((
            tag_no_case("NUMPARAM"),
            opt(tag_no_case("S")),
            opt(tuple((space0, tag("("), space0, tag(")")))),
        )),
        |_| Token::Symbol(Symbol::new(vec!["numparams".to_string()])),
    )(input)
}
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

// NOTE: yabasic tries to call this series of parsers first when detecting a
// decimal number in eval mode, or right after a line number. Note that because
// of how yabasic does the look-ahead that only the decimal digits are actually
// expected to match.
//
// Keep in mind that, because we're using combinators to track the kind of
// token, that we might not use this combination in practice.
fn digits(input: Span) -> IResult<Span, Token> {
    alt((hex_digits, bin_digits, dec_digits, float))(input)
}

fn hex_digits(input: Span) -> IResult<Span, Token> {
    map(preceded(tag("0x"), hex_digit1), |digits: Span| {
        Token::HexDigits(Digits::from(digits))
    })(input)
}

fn bin_digits(input: Span) -> IResult<Span, Token> {
    map(
        preceded(tag("0b"), recognize(many1(one_of("01")))),
        |digits: Span| Token::BinDigits(Digits::from(digits)),
    )(input)
}

fn dec_digits(input: Span) -> IResult<Span, Token> {
    map(digit1, |digits: Span| Token::Digits(Digits::from(digits)))(input)
}

fn float(input: Span) -> IResult<Span, Token> {
    map(double, |n| Token::Num(n))(input)
}

// TODO: Would rather encode these constants as Symbols or tokens
fn pi(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("PI"), |_| {
        Token::Num(std::f64::consts::PI)
    })(input)
}

fn euler(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("EULER"), |_| {
        Token::Num(std::f64::consts::E)
    })(input)
}

fn true_(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("TRUE"), |_| Token::Bool(true))(input)
}

fn false_(input: Span) -> IResult<Span, Token> {
    map(tag_no_case("FALSE"), |_| Token::Bool(false))(input)
}

fn bool_(input: Span) -> IResult<Span, Token> {
    alt((true_, false_))(input)
}

fn strsym(input: Span) -> IResult<Span, Token> {
    map(terminated(name, tag("$")), |sym| Token::StrSym(sym))(input)
}

fn symbol(input: Span) -> IResult<Span, Token> {
    map(name, |sym| Token::Symbol(sym))(input)
}
