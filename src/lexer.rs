// This file will contain the lexer - ie, functions for taking &str input and
// converting it into a collection of Tokens. The parser will then convert
// those tokens into expressions, statements, and so on.
//
// Third, I'll need to look at the syntax! macro from monkey-rust. Their macro
// helps simplify writing parsers for "simple" tokens. Of course, MY token
// parsing is less simple because tokens can involve case insensitivity and
// arbitrary whitespace. But it should be a good starting place, and even if
// I can't make it handle those use cases it should still be able to handle
// the simplest of tokens. I have a LOT of tokens so it should help with
// boilerplate.
//
// Once I have that macro, I should be able to bang out all the "simple"
// token parsers.
//
// Fourth, I'll need to actually port over the parsers I've already written
// in yabasic-rs.
//
// Fifth, let's implement a Tokens collection type. I can basically copy what
// monkey-rust does here - make a struct that wraps Vec<LocatedToken> and
// implement all the traits it says to implement. This will be a data structure
// I can hand to the parser code later on.
//
// Sixth, I'll want to put it all together. monkey-rust has good examples to
// follow here, but basically any given input will be some whitespace, plus
// tokens separated by potential whitespace, plus trailing whitespace. At
// this stage, I can take a given token and use nom_locate to track its
// position in a LocatedSpan.
//
// Finally, monkey-rust has an "illegal" token type, and I think that will
// help with error reporting at the parser level. Now might be a good time to
// implement that.
//
// If I get this far, I should be ready to tackle the parser!

use crate::tokens::Token;
