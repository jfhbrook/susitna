# ADR 011 - Let and Assign Semantics

### Status: Accepted

### Josh Holbrook

## Context

In a traditional BASIC, the `let` keyword is used for both defining variables and assigning new values to them. But this keyword is also optional - most BASIC interpreters understand `i% = 1` and `let i% = 1` to be synonymous.

On the other hand, many modern languages have semantic division between definition and assignment. For example, JavaScript defines variables with `let` or `const`, and uses a simple `=` for assigning to existing variables. This allows JavaScript to distinguish between local and non-local (or global) variables.

Python handles this in reverse - a simple `=` will define a local variable if it's unassigned, but the `nonlocal` and `global` keywords will allow for assigning to those kinds of variables.

## Decision

In Matanuska, `let` will be used for defining variables, and a simple `=` will be used for assignment. This will allow supporting non-local variables in the future, while having syntax and idioms similar to a traditional BASIC.
