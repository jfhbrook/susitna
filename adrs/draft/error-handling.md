# ADR ??? - Error Handling
### Status: Draft
### Josh Holbrook

## Context

Error handling is crucial in an interpreter - after all, most of the things
a user can do will cause errors.

There are a few different kinds of errors:

1. Faults - things with must crash the interpreter
2. Runtime exceptions - things which occur during execution and which may be
   caught
3. Parsing, compile and syntax errors - things which generally will not occur
   during execution (`eval` notwithstanding)

It's tempting to implement runtime and syntax exceptions as non-`Errors`.
However, there is still a need to throw them - the alternative is a `Result`
type, and I'm finding that strategy isn't working as well as I'd like.

## Decision

TK
