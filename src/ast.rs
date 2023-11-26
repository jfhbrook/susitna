// This contains stuff the parser can return.
//
// This file needs to be fleshed out in order to write the parser against it,
// but the parser itself is a very bad reference for most of this file. Chances
// are that the actual data structures exist in other files in yabasic; as I
// find them, I can write them down here.
//
use crate::tokens::Symbol;

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
