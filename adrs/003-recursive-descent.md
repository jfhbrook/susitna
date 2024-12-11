# ADR 003 - Recursive Descent Parser

### Status: Accepted

### Josh Holbrook

## Context

My initial strategy for parsing was to use parser combinators. In Rust, this was the `nom` library. In Typescript, this was `typescript-parsec`.

This strategy is great for hacking up a simple parser. However, I found that it's a relatively inflexible approach, and requires tuning your interface to match the assumptions of the library.

`Crafting Interpreters`, meanwhile, details how to write recursive descent parsers. These are "hand-rolled", which on its face can require more work. However, the architecture is relatively straightforward to understand and implement, and it's _much_ more flexible.

## Decision

Matanuska BASIC will use recursive descent parsers for both its parser and compiler.
