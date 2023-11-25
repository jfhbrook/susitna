use nom::{
    branch::alt,
    bytes::complete::{is_not, tag},
    character::complete::{char, space0},
    combinator::{map, value, verify},
    multi::fold_many0,
    sequence::{delimited, pair, preceded},
    IResult,
};

use crate::tokens::{Span, Token};


// Syntax for strings is based on VB, for now. Eventually I want to implement
// format-strings on some level, but this is a good start.

// Any escaped character
fn escaped_char(input: Span) -> IResult<Span, char> {
    preceded(
        char('\\'),
        alt((
            // TODO: unicode + octal
            // see: https://www.tutorialspoint.com/vb.net/vb.net_character_escapes.htm
            value('\u{07}', char('a')),
            value('\u{08}', char('b')),
            value('\t', char('t')),
            value('\r', char('r')),
            value('\u{0B}', char('v')),
            value('\u{0c}', char('f')),
            value('\n', char('n')),
            value('\\', char('\\')),
        )),
    )(input)
}

// Double-quotes are escaped in VB by being hit twice - ie. "hello ""foo""..." 
fn quote_char(input: Span) -> IResult<Span, char> {
    value('\"', tag("\"\""))(input)
}

// A non-escaped character
fn literal_char(input: Span) -> IResult<Span, String> {
    let not_quote_or_slash = is_not("\"\\");

    map(
        verify(not_quote_or_slash, |s: &Span| !s.fragment().is_empty()),
        |s: Span| s.fragment().to_string()
    )(input)
}

// Part of a string - either a run of literal characters or a single escaped
// character
#[derive(Debug, Clone, PartialEq)]
enum StringFragment {
    Literal(String),
    Escaped(char),
}

fn string_fragment(input: Span) -> IResult<Span, StringFragment>
{
    alt((
        map(literal_char, StringFragment::Literal),
        map(escaped_char, StringFragment::Escaped),
        map(quote_char, StringFragment::Escaped),
    ))(input)
}

// The full string literal - a bunch of fragments wrapped in double-quotes
pub(crate) fn string_literal(input: Span) -> IResult<Span, Token> {
    let build = fold_many0(
        string_fragment,
        String::new,
        |mut string, fragment| {
            match fragment {
                StringFragment::Literal(s) => string.push_str(s.as_str()),
                StringFragment::Escaped(c) => string.push(c),
            }
            string
        },
    );

    map(
        delimited(pair(space0, char('"')), build, pair(char('"'), space0)),
        |s: String| Token::String(s)
    )(input)
}


