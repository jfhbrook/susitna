# ADR ??? - Formatting in Print Statements

### Status: Draft

### Josh Holbrook

## Context

In [ADR 015](../015-string-concat-operator.md), we discussed the semantics of `PRINT` statements in ECMA-55 BASIC. In that ADR, it was in the context of deciding whether or not to treat `;` as a general purpose string concatenation operator. But that investigation also revealed that the semantics of `print` are _strange_, and that we should therefore _not_ implement them naively.

## Decision

TK
