use nom::{
    branch::alt,
    bytes::complete::{tag, tag_no_case},
    character::complete::{char, one_of, space0},
    combinator::map,
    error::ParseError,
    multi::many1,
    sequence::{delimited, pair, preceded, tuple},
    IResult,
};

use crate::context::GlobalContext;
use crate::exception::Exception;
use crate::interpreter::Interpreter;
use crate::value::{parse_value, Value};
use crate::variable::{parse_id, Id};

#[derive(Debug, Clone)]
pub enum Expr {
    // Operators, in order of precedence in Visual Basic. Operators of equal
    // precedence are evaluated left to right.

    // 0. Value literals
    Constant(Value),
    Id(Id),

    // 1. parens
    Parens(Box<Expr>),

    // 2. VB has an Await keyword...
    // Await(Box<Expr>)
    // (other keywords here too, such as...)
    // Call(Vec<Expr>, IndexMap<String, Expr>)

    // 3. Exponentiation
    Pow(Box<Expr>, Box<Expr>),

    // 4. +/- signs
    Negative(Box<Expr>),
    Positive(Box<Expr>),

    // 5. times/divide
    Multiply(Box<Expr>, Box<Expr>),
    Divide(Box<Expr>, Box<Expr>),
    // (A .\ b as solving for x in Ax=b, as in MATLAB)
    LeftDivide(Box<Expr>, Box<Expr>),
    // (A .* B) as element-wise multiplication, as in MATLAB)
    ElementWiseMultiply(Box<Expr>, Box<Expr>),

    // 6. VB has a Mod operator
    Mod(Box<Expr>, Box<Expr>),

    // 7. add/subtract
    Add(Box<Expr>, Box<Expr>),
    Subtract(Box<Expr>, Box<Expr>),
    // 8. string concatenation - VB has a separate cat operator, however
    // OG basic dialects overload + - but this is always an option!
    // Cat(Box<Expr>, Box<Expr>)

    // 9. bitshift operators
    LeftShift(Box<Expr>, Box<Expr>),
    RightShift(Box<Expr>, Box<Expr>),

    // 10. Comparisons
    Eq(Box<Expr>, Box<Expr>),
    Ne(Box<Expr>, Box<Expr>),
    Lt(Box<Expr>, Box<Expr>),
    Gt(Box<Expr>, Box<Expr>),
    Le(Box<Expr>, Box<Expr>),
    Ge(Box<Expr>, Box<Expr>),
    // VB does Is/IsNot for object identity, Like, etc

    // 11. Logical operators
    And(Box<Expr>, Box<Expr>),
    Or(Box<Expr>, Box<Expr>),
    Xor(Box<Expr>, Box<Expr>),
    Not(Box<Expr>),
}

fn parse_literal<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    delimited(
        space0,
        alt((
            map(parse_value, |v| Expr::Constant(v)),
            map(parse_id, |i| Expr::Id(i)),
        )),
        space0,
    )(input)
}

fn parse_parens<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    delimited(
        space0,
        delimited(
            char('('),
            map(parse_expr, |expr: Expr| -> Expr {
                Expr::Parens(Box::new(expr))
            }),
            char(')'),
        ),
        space0,
    )(input)
}

// Binary operators
enum Op {
    Pow,

    Multiply,
    Divide,
    LeftDivide,
    ElementWiseMultiply,

    Add,
    Subtract,

    LeftShift,
    RightShift,

    Eq,
    Ne,
    Lt,
    Gt,
    Le,
    Ge,

    And,
    Or,
    Xor,
}

fn fold_ops(left: Expr, (op, right): (Op, Expr)) -> Expr {
    match op {
        Op::Pow => Expr::Pow(Box::new(left), Box::new(right)),

        Op::Multiply => Expr::Multiply(Box::new(left), Box::new(right)),
        Op::Divide => Expr::Divide(Box::new(left), Box::new(right)),
        Op::LeftDivide => Expr::LeftDivide(Box::new(left), Box::new(right)),
        Op::ElementWiseMultiply => Expr::ElementWiseMultiply(Box::new(left), Box::new(right)),

        Op::Add => Expr::Add(Box::new(left), Box::new(right)),
        Op::Subtract => Expr::Subtract(Box::new(left), Box::new(right)),

        Op::LeftShift => Expr::LeftShift(Box::new(left), Box::new(right)),
        Op::RightShift => Expr::RightShift(Box::new(left), Box::new(right)),

        Op::Eq => Expr::Eq(Box::new(left), Box::new(right)),
        Op::Ne => Expr::Ne(Box::new(left), Box::new(right)),
        Op::Lt => Expr::Lt(Box::new(left), Box::new(right)),
        Op::Gt => Expr::Gt(Box::new(left), Box::new(right)),
        Op::Le => Expr::Le(Box::new(left), Box::new(right)),
        Op::Ge => Expr::Ge(Box::new(left), Box::new(right)),

        Op::And => Expr::And(Box::new(left), Box::new(right)),
        Op::Or => Expr::Or(Box::new(left), Box::new(right)),
        Op::Xor => Expr::Xor(Box::new(left), Box::new(right)),
    }
}

fn parse_pow<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    let (input, left): (&str, Expr) = alt((parse_parens, parse_literal))(input)?;
    let (input, right): (&str, Vec<(Op, Expr)>) = delimited(
        space0,
        many1(tuple((
            delimited(space0, map(char('^'), |_| Op::Pow), space0),
            alt((parse_parens, parse_literal)),
        ))),
        space0,
    )(input)?;
    Ok((input, right.into_iter().fold(left, fold_ops)))
}

fn parse_negative<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    map(
        pair(preceded(space0, one_of("+-")), parse_up_to_negative),
        |(op, expr)| -> Expr {
            if op == '-' {
                Expr::Negative(Box::new(expr))
            } else {
                Expr::Positive(Box::new(expr))
            }
        },
    )(input)
}

fn parse_up_to_negative<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    alt((parse_parens, parse_pow, parse_negative, parse_literal))(input)
}

fn parse_multiply<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    let (input, left): (&str, Expr) = parse_up_to_negative(input)?;
    let (input, right): (&str, Vec<(Op, Expr)>) = delimited(
        space0,
        many1(tuple((
            delimited(
                space0,
                alt((
                    map(tag("*"), |_| Op::Multiply),
                    map(tag("/"), |_| Op::Divide),
                    map(tag(".\\"), |_| Op::LeftDivide),
                    map(tag(".*"), |_| Op::ElementWiseMultiply),
                )),
                space0,
            ),
            parse_up_to_negative,
        ))),
        space0,
    )(input)?;
    Ok((input, right.into_iter().fold(left, fold_ops)))
}

fn parse_mod<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    delimited(
        space0,
        map(
            preceded(
                delimited(space0, tag_no_case("mod"), space0),
                parse_up_to_mod,
            ),
            |expr| Expr::Not(Box::new(expr)),
        ),
        space0,
    )(input)
}

fn parse_up_to_mod<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    alt((
        parse_parens,
        parse_pow,
        parse_negative,
        parse_multiply,
        parse_mod,
        parse_literal,
    ))(input)
}

fn parse_add<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    let (input, left): (&str, Expr) = parse_up_to_mod(input)?;
    let (input, right): (&str, Vec<(Op, Expr)>) = delimited(
        space0,
        many1(tuple((
            delimited(
                space0,
                alt((
                    map(char('+'), |_| Op::Add),
                    map(char('-'), |_| Op::Subtract),
                )),
                space0,
            ),
            parse_up_to_mod,
        ))),
        space0,
    )(input)?;
    Ok((input, right.into_iter().fold(left, fold_ops)))
}

fn parse_up_to_add<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    alt((
        parse_parens,
        parse_pow,
        parse_negative,
        parse_multiply,
        parse_mod,
        parse_add,
        parse_literal,
    ))(input)
}

fn parse_shift<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    let (input, left): (&str, Expr) = parse_up_to_add(input)?;
    let (input, right): (&str, Vec<(Op, Expr)>) = delimited(
        space0,
        many1(tuple((
            delimited(
                space0,
                alt((
                    map(tag("<<"), |_| Op::LeftShift),
                    map(tag(">>"), |_| Op::RightShift),
                )),
                space0,
            ),
            parse_up_to_add,
        ))),
        space0,
    )(input)?;
    Ok((input, right.into_iter().fold(left, fold_ops)))
}

fn parse_up_to_shift<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    alt((
        parse_parens,
        parse_pow,
        parse_negative,
        parse_multiply,
        parse_mod,
        parse_add,
        parse_shift,
        parse_literal,
    ))(input)
}

fn parse_comparison<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    let (input, left): (&str, Expr) = parse_up_to_shift(input)?;
    let (input, right): (&str, Vec<(Op, Expr)>) = delimited(
        space0,
        many1(tuple((
            delimited(
                space0,
                alt((
                    map(char('='), |_| Op::Eq),
                    map(tag("<>"), |_| Op::Ne),
                    map(char('<'), |_| Op::Lt),
                    map(char('>'), |_| Op::Gt),
                    map(tag("<="), |_| Op::Le),
                    map(tag(">="), |_| Op::Ge),
                )),
                space0,
            ),
            parse_up_to_shift,
        ))),
        space0,
    )(input)?;
    Ok((input, right.into_iter().fold(left, fold_ops)))
}

fn parse_up_to_comparison<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    alt((
        parse_parens,
        parse_pow,
        parse_negative,
        parse_multiply,
        parse_mod,
        parse_add,
        parse_shift,
        parse_comparison,
        parse_literal,
    ))(input)
}

fn parse_not<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    delimited(
        space0,
        map(
            preceded(
                delimited(space0, tag_no_case("not"), space0),
                parse_up_to_not,
            ),
            |expr| Expr::Not(Box::new(expr)),
        ),
        space0,
    )(input)
}

fn parse_up_to_not<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    alt((
        parse_parens,
        parse_pow,
        parse_negative,
        parse_multiply,
        parse_mod,
        parse_add,
        parse_shift,
        parse_comparison,
        parse_not,
        parse_literal,
    ))(input)
}

fn parse_and_or<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    let (input, left): (&str, Expr) = parse_up_to_not(input)?;
    let (input, right): (&str, Vec<(Op, Expr)>) = delimited(
        space0,
        many1(tuple((
            delimited(
                space0,
                alt((
                    map(tag_no_case("and"), |_| Op::And),
                    map(tag_no_case("or"), |_| Op::Or),
                    map(tag_no_case("xor"), |_| Op::Xor),
                )),
                space0,
            ),
            alt((
                parse_parens,
                parse_multiply,
                parse_add,
                parse_comparison,
                parse_not,
                parse_literal,
            )),
        ))),
        space0,
    )(input)?;
    Ok((input, right.into_iter().fold(left, fold_ops)))
}

fn parse_up_to_and_or<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    alt((
        parse_parens,
        parse_pow,
        parse_negative,
        parse_multiply,
        parse_mod,
        parse_add,
        parse_shift,
        parse_comparison,
        parse_not,
        parse_and_or,
        parse_literal,
    ))(input)
}

pub(crate) fn parse_expr<'a, E>(input: &'a str) -> IResult<&'a str, Expr, E>
where
    E: ParseError<&'a str>,
{
    parse_up_to_and_or(input)
}

#[cfg(test)]
mod parse_tests {
    use anyhow::Result;
    use nom::error::VerboseError;

    use crate::expression;
    use crate::expression::Expr;
    use crate::value::Value;

    /*
     * 1. basic operators in isolation work
     * 2. plus, minus, times, divide
     * 3. comparisons
     * 4. logical operators
     * 5. comparisons, logical operators and comparisons
     * 6. negative/positive numbers
     */

    #[test]
    fn parse_string_literal() -> Result<()> {
        let (rem, expr) = expression::parse_literal::<VerboseError<_>>("\"hello world\"")?;
        assert_eq!(rem, "");
        match expr {
            Expr::Constant(Value::String(value)) => {
                assert_eq!(value, String::from("hello world"));
            }
            _ => assert!(false),
        };
        Ok(())
    }

    #[test]
    fn parse_integer_literal() -> Result<()> {
        let (rem, expr) = expression::parse_literal::<VerboseError<_>>("123")?;
        assert_eq!(rem, "", "expression is fully parsed");
        match expr {
            Expr::Constant(Value::Integer(value)) => {
                assert_eq!(value, 123, "value is 123");
            }
            _ => assert!(false, "expect Expr::Constant(...), actually {:?}", expr),
        };
        Ok(())
    }

    #[test]
    fn parse_parens_literal() -> Result<()> {
        let (rem, expr) = expression::parse_parens::<VerboseError<_>>("(123)")?;
        assert_eq!(
            rem, "",
            "expected fully consumed input - remaining: {}",
            rem
        );
        match expr {
            Expr::Parens(expr) => match *expr {
                Expr::Constant(Value::Integer(value)) => {
                    assert_eq!(value, 123, "value is 123");
                }
                _ => assert!(false, "expect Expr::Constant(...), actually {:?}", expr),
            },
            _ => assert!(false, "expect Expr::Parens(...), actually {:?}", expr),
        };
        Ok(())
    }

    #[test]
    fn parse_1_plus_1() -> Result<()> {
        let (rem, expr) = expression::parse_add::<VerboseError<_>>("1 + 1")?;
        assert_eq!(
            rem, "",
            "expected fully consumed input - remaining: {}",
            rem
        );
        match expr {
            Expr::Add(left, right) => match (*left, *right) {
                (Expr::Constant(Value::Integer(left)), Expr::Constant(Value::Integer(right))) => {
                    assert_eq!(left, 1, "left is 1");
                    assert_eq!(right, 1, "right is 1");
                }
                _ => assert!(false, "expect (Expr::Constant(...), Expr::Constant(...))"),
            },
            _ => assert!(false, "expect Expr::Parens(...), actually {:?}", expr),
        };
        Ok(())
    }

    #[test]
    fn parse_2_times_2() -> Result<()> {
        let (rem, expr) = expression::parse_multiply::<VerboseError<_>>("2 * 2")?;
        assert_eq!(
            rem, "",
            "expected fully consumed input - remaining: {}",
            rem
        );
        match expr {
            Expr::Multiply(left, right) => match (*left, *right) {
                (Expr::Constant(Value::Integer(left)), Expr::Constant(Value::Integer(right))) => {
                    assert_eq!(left, 2, "left is 2");
                    assert_eq!(right, 2, "right is 2");
                }
                _ => assert!(false, "expect (Expr::Constant(...), Expr::Constant(...))"),
            },
            _ => assert!(false, "expect Expr::Parens(...), actually {:?}", expr),
        };
        Ok(())
    }

    #[test]
    fn parse_add_times() -> Result<()> {
        let (rem, expr) = expression::parse_expr::<VerboseError<_>>("1 + 2 * 3")?;
        assert_eq!(
            rem, "",
            "expected fully consumed input - remaining: {}",
            rem
        );
        match expr {
            Expr::Add(left, right) => {
                match *left {
                    Expr::Constant(Value::Integer(left)) => {
                        assert_eq!(left, 1, "left is 1");
                    }
                    _ => assert!(false, "add left to be Expr::Constant(...)"),
                };

                match *right {
                    Expr::Multiply(left, right) => {
                        match (*left, *right) {
                            (
                                Expr::Constant(Value::Integer(left)),
                                Expr::Constant(Value::Integer(right)),
                            ) => {
                                assert_eq!(left, 2, "multiply left is 2");
                                assert_eq!(right, 3, "multiply right is 3");
                            }
                            _ => {
                                assert!(false, "expected multiply to be Constants");
                            }
                        };
                    }
                    _ => {
                        assert!(false, "add right to be Expr::Multiply(...)");
                    }
                };
            }
            _ => {
                assert!(false, "expect Expr::Parens(...), actually {:?}", expr);
            }
        };
        Ok(())
    }

    #[test]
    fn parse_1_and_1() -> Result<()> {
        let (rem, expr) = expression::parse_and_or::<VerboseError<_>>("1 and 1")?;
        assert_eq!(
            rem, "",
            "expected fully consumed input - remaining: {}",
            rem
        );
        match expr {
            Expr::And(left, right) => match (*left, *right) {
                (Expr::Constant(Value::Integer(left)), Expr::Constant(Value::Integer(right))) => {
                    assert_eq!(left, 1, "left is 1");
                    assert_eq!(right, 1, "right is 1");
                }
                _ => assert!(false, "expect (Expr::Constant(...), Expr::Constant(...))"),
            },
            _ => assert!(false, "expect Expr::Parens(...), actually {:?}", expr),
        };
        Ok(())
    }
}
