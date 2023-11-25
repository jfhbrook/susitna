// Parsers for various number-like values.
//
// TODO: Floats are currently using nom's default double parser, and ints are
// currently using yabasic's standard formats for digits. I'd like to have a
// stronger opinion about this - perhaps borrowing from VB?

use nom::{
    branch::alt,
    bytes::complete::tag,
    character::complete::{digit1, hex_digit1, one_of},
    combinator::{map, map_res, recognize},
    multi::many1,
    number::complete::double,
    sequence::preceded,
    IResult,
};

use crate::tokens::{Span, Token};

// TODO: yabasic's parser matches line_no in compile mode and uses state to
// trigger loading a separator and potentially a number for the next two
// tokens. my plan is to match these at the parser level, something like
// pair(line_no, alt((single_newline, preceded(space0, alt((eval_digits, etc)))))).
//
// NOTE: the "cond" combinator might let us use flags to generate parsers
pub(crate) fn line_no(input: Span) -> IResult<Span, Token> {
    map(
        map_res(digit1, |s: Span| s.fragment().parse::<i64>()),
        |i: i64| Token::LineNo(i),
    )(input)
}

pub(crate) fn float(input: Span) -> IResult<Span, Token> {
    map(double, |n| Token::Num(n))(input)
}

// NOTE: yabasic tries to call this series of parsers first when detecting a
// decimal number in eval mode, or right after a line number. Note that because
// of how yabasic does the look-ahead that only the decimal digits are actually
// expected to match.
//
// Keep in mind that, because we're using combinators to track the kind of
// token, that we might not use this combination in practice.
pub(crate) fn digits(input: Span) -> IResult<Span, Token> {
    alt((hex_digits, bin_digits, dec_digits))(input)
}

fn hex_digits(input: Span) -> IResult<Span, Token> {
    map(
        map_res(preceded(tag("0x"), hex_digit1), |s: Span| {
            i64::from_str_radix(s.fragment(), 16)
        }),
        |i: i64| Token::HexDigits(i),
    )(input)
}

fn bin_digits(input: Span) -> IResult<Span, Token> {
    map(
        map_res(
            preceded(tag("0b"), recognize(many1(one_of("01")))),
            |s: Span| i64::from_str_radix(s.fragment(), 2),
        ),
        |i: i64| Token::BinDigits(i),
    )(input)
}

fn dec_digits(input: Span) -> IResult<Span, Token> {
    map(
        map_res(digit1, |s: Span| s.fragment().parse::<i64>()),
        |i: i64| Token::Digits(i),
    )(input)
}
