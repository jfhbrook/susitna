// This contains stuff the parser can return.
//
// This file needs to be fleshed out in order to write the parser against it,
// but the parser itself is a very bad reference for most of this file. Chances
// are that the actual data structures exist in other files in yabasic; as I
// find them, I can write them down here.

use thiserror::Error;

use crate::tokens::Symbol;

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

#[derive(PartialEq, Debug, Clone)]
pub(crate) enum Literal {
    Const(f64),
    Float(f64),
    Int(i64),
    String(String),
}

#[derive(PartialEq, Debug, Clone)]
pub(crate) enum Ident {
    SymbolOrLineno(Symbol),
    FunctionName(Symbol),
    FunctionOrArray(Symbol),
    StringFunctionOrArray(Symbol),
}

#[derive(PartialEq, Debug, Clone)]
pub(crate) enum Expr {
    Literal(Literal),
    Ident(Ident),
}

#[derive(PartialEq, Debug, Clone)]
pub(crate) struct Docu(pub String);

// NOTE: yabasic tracks "the number of newlines" - do we need to track
// the count of separators? or the values of the separators?
#[derive(PartialEq, Debug, Clone)]
pub(crate) struct Sep(pub i64);

#[derive(PartialEq, Debug, Clone)]
pub(crate) struct Program {
    statements: Vec<Statement>,
}

impl Program {
    pub fn new(statements: Vec<Statement>) -> Program {
        Program { statements }
    }
}

#[derive(PartialEq, Debug, Clone)]
pub(crate) enum Statement {}
