# ADR ??? - JavaScript-Like Number Semantics

### Status: Draft

### Josh Holbrook

## Context

While Matanuska has decided to implement both double and integer literals and sigils, numbers are otherwise poorly specified.

First, the format of number literals is currently not well-specified. The implementation currently leans on JavaScript's `parseInt`, and is therefore JavaScript-compliant by default. But there are alternatives - for instance, aiming for compatibility with ECMA-55, or a format similar to VB.NET.

Second, these types are currently not enforced by the implementation, as JavaScript only has a single `number` type.

This *could* potentially be enforced on a type level. This could be done entirely through type checking in the compiler. It could also be done with a wrapper in the `Value` type. But as it stands, this information is largely ignored.

It could also be implemented more directly in a language that *does* have distinct number types, such a Rust. This would mean that, at the boundary between Rust and TypeScript, the type information would need to be understood - but once within Rust, the types would act as expected.

But an interesting possibility is simply specifying that the language has JavaScript-like number semantics. This would be what's most straightforward from an implementation perspective today, if nothing else. But it's also an appealing choice from a simplicity perspective as well.

[BASIC8](https://paladin-t.github.io/b8/docs/manual) is an interesting example. It stores numbers internally as either 32-bit signed integers, or IEEE-754 floats. It implicitly casts an integer to a float when operations introduce fractional parts, and casts floats *back* to integers when they *don't* have fractional parts. This is interesting behavior, but also behavior that could be readily emulated in a language like Rust.

## Decision

TK
