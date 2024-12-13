# ADR ??? - Semicolon String Concatenation Operator

### Status: Draft

### Josh Holbrook

## Context

While researching [fantasy consoles](https://github.com/paladin-t/fantasy), I learned about a BASIC implementation called [Atto](https://atto.devicefuture.org/). In its ["from BASIC" doc](https://github.com/devicefuture/atto/blob/main/docs/frombasic.md), it mentions that it uses `;` as its string concatenation operator.

This seems like an odd decision. But it makes sense when you remember that `print` and other statements in traditional BASIC (as well as [MEG-4 BASIC](https://bztsrc.gitlab.io/meg4/manual_en.html#basic)) use `;` to separate expressions. As I understand it, this is ad-hoc syntax in those commands. What Atto does here is take this syntax and *generalizes* it - very interesting.

Currently, Matanuska BASIC treats `+` as a concatenation operator. This isn't an unusual choice - BASIC8 goes this route, for example. But... it's an interesting thought.

## Decision

TK
