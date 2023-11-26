// This file will have the parser code. These will take a Tokens collection
// type and return Expressions, Statements, etc.
//
// I'm going to find limited value in naively implementing yabasic's parser.
// It's a very big parser, and I just don't need to complete it in order to
// get a working program.
//
// There are two directions to go here:
//
// 1. Implement the non-parser parts from yabasic. This will give me the
//    infrastructure to actually run simple commands, and give me a better
//    idea of how a parsed BASIC program is structured anyway.
// 2. Go through yabasic's parser and/or what I did in s7bas, and break feature
//    sets into milestones. Then, just implement those milestones one at a
//    time. This may also be a good time to delete some tokenization code I
//    know I won't use.
//

use crate::ast::{Command, Expr, Instruction, Line};
use crate::tokens::{Ident, Token, Tokens};
use nom::{
    branch::alt,
    bytes::complete::take,
    combinator::{map, verify},
    multi::separated_list0,
    sequence::{preceded, separated_pair},
    IResult,
};

// Like "tag" but for tokens, heavily informed by monkey-rust's parser. Note
// that the contents of the token must also match, since it uses an equality
// check - if you just need to match on the variant regardless of the insides,
// you'll have to figure out something else.
fn token<'a>(tag: Token) -> impl FnMut(Tokens<'a>) -> IResult<Tokens<'a>, Tokens<'a>> {
    let tag = tag.clone();
    move |input: Tokens<'a>| -> IResult<Tokens<'a>, Tokens<'a>> {
        verify(take(1usize), |t: &Tokens| t.tokens[0].token == tag)(input)
    }
}

// TODO: I'm going to need to write a whole family of these parsers - that
// is, combinators which match the token's variant and then pull the insides
// out into a useful type for mapping purposes. A macro might help?
fn strsym(input: Tokens) -> IResult<Tokens, Ident> {
    unimplemented!("strsym");
}

fn rem(input: Tokens) -> IResult<Tokens, String> {
    unimplemented!("rem");
}

// TODO: we should be able to parse open/close statements which are missing
// the close - loop, endif, next, until, wend

// TODO: I would like this to return Tokens instead of Vec<LocatedToken>, but
// the reference implementation actually expects to *borrow* the vec. They
// allocate the Vec, lend it to create Tokens, then pass that into the parser
// inside a function - example here:
//
//     https://github.com/Rydgel/monkey-rust/blob/master/lib/parser/mod.rs#L331-L336

fn instruction(input: Tokens) -> IResult<Tokens, Instruction> {
    unimplemented!("instruction");
}

fn command(input: Tokens) -> IResult<Tokens, Command> {
    unimplemented!("command");
}

pub fn expr(input: Tokens) -> IResult<Tokens, Expr> {
    unimplemented!("expr");
}

// yabasic includes scanning code which detects and emits a special token to
// mark an implicit endif. if we are to implement similar logic, it will
// happen in the parser code.
/*
pub fn implicit_endif(input: Span) -> IResult<Span, Token> {
    alt((
        token(Token::DoubleLineEnding),
        token(Token::SingleLineEnding),
        rem,
    ))(input)
}
*/

// This is some code where I started trying to write an assignment parser. It's
// not particularly useful at this stage, but it shows a bit of how the
// parsers would likely compose.
/*
type Assignment = Expr;

fn assignment(input: Tokens) -> IResult<Tokens, Assignment> {
    alt((
        string_assignment,
        preceded(token(Token::Let), string_assignment),
        number_assignment,
        preceded(token(Token::Let), number_assignment),
    ))(input)
}

fn string_assignment(input: Tokens) -> IResult<Tokens, Assignment> {
    alt((map(
        separated_pair(strsym, token(Token::Eq), string_expr),
        |(sym, expr)| {
            unimplemented!("add_command_with_sym_and_diag");
        },
    ),))(input)
}

fn number_assignment(input: Tokens) -> IResult<Tokens, Assignment> {
    unimplemented!("number_assignment");
}
*/
