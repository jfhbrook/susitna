// This contains stuff the parser can return.
//
// This file needs to be fleshed out in order to write the parser against it,
// but the parser itself is a very bad reference for most of this file. Chances
// are that the actual data structures exist in other files in yabasic; as I
// find them, I can write them down here.

use thiserror::Error;

use crate::tokens::Ident;

// As mentioned in crate::error, exception handling needs a lot of work.
//
// Right now, all this can really do is use thiserror to represent a few
// simple error types which can be represented in the language. But really
// I need something more like Python's errors - a struct with a code, a
// message and a traceback. That means awareness of the line which raised the
// error.
//
// It also needs to represent all errors possible, not just ones that are
// easy to clone. That's in part because I don't want two classes of errors,
// but also because I want those errors representable in the language.
//
// The punchline is likely a bunch of "manual" conversion code for various
// kinds of errors.
//
// A final note: in s7bas, I used exceptions for non-error cases like
// Python does. That includes keyboard interrupts of course (consistent with
// rustyline) but also execution cases like Halt and parse cases like Eof.
// I'm not sure I want to replicate that here.
//
// Note that miette might be useful here.
#[derive(Error, PartialEq, Debug, Clone)]
pub(crate) enum Exception {
    #[error("parse error")]
    ParseError(String),

    #[error("value error")]
    ValueError(String),

    #[error("name error")]
    NameError(String, String),

    #[error("file error")]
    FileError(String),

    // These can be triggered by errors from rustyline
    #[error("keyboard interrupt")]
    KeyboardInterrupt,

    #[error("EOF")]
    Eof,
    // #[error("halt")]
    // Halt(Interpreter<GlobalContext>),

    // #[error("goto")]
    // Goto(i64, Interpreter<GlobalContext>),
}

// Literal values. This is somewhat borrowed from yabasic, but will probably
// end up evolving a lot.
#[derive(PartialEq, Debug, Clone)]
pub(crate) enum Literal {
    Const(f64),
    Float(f64),
    Int(i64),
    String(String),
}

// yabasic calls these identifiers. s7bas didn't really have this concept, and
// in general there's some semantic confusion between symbols, variables,
// identifiers and values.
//
// my read is:
//
// - variables are specific to things you can assign and read from as
//   variables in the language
// - symbols are anything that has an identifier (called a "name" in the
//   current lexer
// - identifiers are "names" for symbols
// - values are what symbols actually contain
//
// TODO: iron out these semantic issues, here and in the lexer.
#[derive(PartialEq, Debug, Clone)]
pub(crate) enum Identifier {
    SymbolOrLineno(Ident),
    FunctionName(Ident),
    FunctionOrArray(Ident),
    StringFunctionOrArray(Ident),
}

// In a classic BASIC, the basic building blocks are called instructions.
#[derive(Debug, Clone)]
pub enum Instruction {
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
    // TODO: yabasic supports "docstrings". Kinda a cool feature - do I
    // want it?
    // Docu(String)
}

// Commands are made up of a series of Instructions separated by colon
// separators. These are generally numbered and entered as Lines.
#[derive(Debug, Clone)]
pub struct Command {
    instructions: Vec<Instruction>,
}

impl Command {
    fn new(instructions: Vec<Instruction>) -> Command {
        Command { instructions }
    }
}

// Instructions may contain expressions. Expressions can be evaluated into
// values. These are all expression types I intended to define in s7bas.
#[derive(Debug, Clone)]
pub enum Expr {
    // Operators, in order of precedence in Visual Basic. Operators of equal
    // precedence are evaluated left to right.

    // 0. Value literals
    Literal(Literal),
    Ident(Ident),

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

// Lines are "numbered commands".
#[derive(Debug, Clone)]
pub struct Line {
    line_no: u16,
    command: Command,
}
