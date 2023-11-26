use rustyline::error::ReadlineError;
use thiserror::Error;

use crate::ast::Exception;

// Error handling needs a LOT of work.
//
// Right now there are two "kinds" of errors:
//
// 1. Exceptions, an enum in the AST which supports PartialEq and Clone
// 2. Errors, which include error types that can't be represented in the AST
//
// I want exceptions to be representable in the language. But I also need to
// handle errors wrapping things which *don't* support those traits - eg.
// IOErrors and ReadlineErrors. What that ultimately means is that I'll
// probably want to write smarter code that "manually" copies over whichever
// context is necessary.
//
// See crate::ast::Exception and crate::host for more details on what's needed
// for error handling.
#[derive(Error, Debug)]
pub enum Error {
    #[error("io error")]
    IOError(#[from] std::io::Error),

    #[error("Exception")]
    Exception(#[from] Exception),

    // #[error("line error")]
    // LineError(i64),
    #[error("readline error")]
    ReadlineError(#[from] ReadlineError),
    // #[error("instruction error")]
    // InstructionError(String),
}
