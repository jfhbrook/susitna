# ADR ??? - Sigils as Typecasting Operators

### Status: Draft

### Josh Holbrook

## Context

While exploring [fantasy consoles](https://github.com/paladin-t/fantasy), I learned about a console named [atto](https://atto.devicefuture.org/). One interesting feature of atto is that it uses sigils not as _variable types_, but as _typecasting operators_. For instance, `n$` doesn't mean `n` has a string type, but that the variable `n` is being typecast as a string. Alternately, `some_str%` would cast that string to an int.

This is a _very_ interesting spin on sigils, and I'm intrigued.

## Decision

TK
