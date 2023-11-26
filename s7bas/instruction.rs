use nom::{
    branch::alt,
    bytes::complete::{is_not, tag_no_case},
    character::complete::{char, space0, space1},
    combinator::{map, opt},
    error::ParseError,
    multi::separated_list1,
    sequence::{delimited, pair, preceded, separated_pair, terminated, tuple},
    IResult,
};

use crate::expression::{parse_expr, Expr};
use crate::value::{parse_integer, parse_string};
use crate::variable::{parse_id, Id};

/*
pub enum Access {
    Input,
    Output,
}

pub type FileDescriptor = i64;
*/

#[derive(Debug, Clone)]
pub(crate) enum Instruction {
    Print(Option<i64>, Vec<Expr>),
    Remark(String),
    // Let(Id, Expr),

    // Conditionals (see: Boolean logic, comparisons)
    // If(Expr, Box<Instruction>),

    // Goto(Expr),

    // For(Id, Expr, Expr, Option<i64>),
    // Next(Vec<Id>),
    // End,

    // Gosub(Expr),
    // Return,

    // Dim(Id, Vec<i64>),
    // Data(Vec<Constant>),

    // Input(Option<i64>, Vec<Id>),
    // Open(Value, Access, FileDescriptor),
    // Close(FileDescriptor),
    // Poke(Vec<Value>),
    // Read(Vec<Id>),
    List(Option<i64>, Option<i64>),
    Save(String),
    Load(String),
    Run(Option<i64>),
    // Restore,
    // Stop,

    // Sys(Value),
    // Wait(Vec<Value>),
    Expr(Expr),
}

fn parse_print<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
where
    E: ParseError<&'a str>,
{
    map(
        preceded(
            delimited(space0, tag_no_case("print"), space0),
            pair(
                opt(delimited(
                    tuple((space0, char('#'), space0)),
                    parse_integer,
                    tuple((space0, char(','), space0)),
                )),
                separated_list1(delimited(space0, char(';'), space0), parse_expr),
            ),
        ),
        |(fd, exps)| Instruction::Print(fd, exps),
    )(input)
}

fn parse_let<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
where
    E: ParseError<&'a str>,
{
    map(
        separated_pair(
            preceded(delimited(space0, tag_no_case("let"), space0), parse_id),
            delimited(space0, char('='), space0),
            parse_expr,
        ),
        |(id, expr)| Instruction::Let(id, expr),
    )(input)
}

fn parse_remark<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
where
    E: ParseError<&'a str>,
{
    map(
        preceded(delimited(space0, tag_no_case("rem"), space1), is_not("\n")),
        |remark: &str| Instruction::Remark(String::from(remark)),
    )(input)
}

fn parse_list<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
where
    E: ParseError<&'a str>,
{
    // TODO: support ranges of lines
    map(tag_no_case("list"), |_| Instruction::List(None, None))(input)
}

// TODO: include extra options a la c64:
// https://www.c64-wiki.com/wiki/SAVE
fn parse_save<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
where
    E: ParseError<&'a str>,
{
    map(
        preceded(pair(tag_no_case("save"), space0), parse_string),
        |filename: String| Instruction::Save(filename),
    )(input)
}

// TODO: include extra options a la c64:
// https://www.c64-wiki.com/wiki/LOAD
fn parse_load<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
where
    E: ParseError<&'a str>,
{
    map(
        preceded(pair(tag_no_case("load"), space0), parse_string),
        |filename: String| Instruction::Load(filename),
    )(input)
}

fn parse_run<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
where
    E: ParseError<&'a str>,
{
    preceded(
        pair(tag_no_case("run"), space0),
        alt((
            map(terminated(parse_integer, space0), |i: i64| {
                Instruction::Run(Some(i))
            }),
            map(space0, |_| Instruction::Run(None)),
        )),
    )(input)
}

impl Instruction {
    pub fn parse<'a, E>(input: &'a str) -> IResult<&'a str, Instruction, E>
    where
        E: ParseError<&'a str>,
    {
        alt((
            parse_remark,
            parse_let,
            parse_print,
            parse_list,
            parse_save,
            parse_load,
            parse_run,
            map(parse_expr, |expr| Instruction::Expr(expr)),
        ))(input)
    }
}
