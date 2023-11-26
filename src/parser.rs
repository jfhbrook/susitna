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

use crate::ast::{Command, Expr, Instruction};
use crate::tokens::{Symbol, Token, Tokens};
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
fn strsym(input: Tokens) -> IResult<Tokens, Symbol> {
    unimplemented!("strsym");
}

// TODO: we should be able to parse open/close statements which are missing
// the close - loop, endif, next, until, wend

// TODO: programs are actually made up of numbered lines, which are in turn
// made of statements broken up by separators. generally speaking, yabasic
// tokenizes all of the following into separators:
//
// - double line ending
// - single line ending
// - colon
// - rem
// - comment
//
// however, yabasic also tracks a bunch of state in its lexer, and in practice
// these are treated differently:
//
// - double line endings can signal the end of repl input
// - single line endings separate lines, but colons separate statements on the
//   same line
// - remarks and comments aren't separators /as such/, but they also mark the
//   end of a prior statement
//
// finally, unlike other open-close statement types, if statements can end
// implicitly if/when they cross a separator.
//
// ultimately, what this means is that the lexer needs to be refactored to
// use separate token types for these types of separators, and the logic
// for numbering lines / breaking input / etc needs to be lifted into the
// parser.
/*
pub(crate) fn program(input: Tokens) -> IResult<Tokens, Program> {
    map(
        separated_list0(token(Token::Sep), statement),
        |s: Vec<Statement>| Program::new(s),
    )(input)
}
*/

fn instruction(input: Tokens) -> IResult<Tokens, Instruction> {
    unimplemented!("instruction");
}

fn command(input: Tokens) -> IResult<Tokens, Command> {
    unimplemented!("command");
}

pub(crate) fn expr(input: Tokens) -> IResult<Tokens, Expr> {
    unimplemented!("expr");
}

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
