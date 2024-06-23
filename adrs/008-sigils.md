# ADR 008 - Sigils
### Status: Accepted
### Josh Holbrook

## Context

`Writing Interactive Compilers & Interpreters` introduces the concept of
*manifest data types*. This means that the type of a variable is known at
compile time.

BASIC has manifest data types, insofar as the language distinguishes between
numbers and strings. Syntactically, it does this by *postfixing* identifiers
with a [sigil](https://www.perl.com/article/on-sigils/). By doing this, and
by using distinct syntax for defining other types, the compiler is able to
track and enforce the type of a variable throughout execution.

From a compiler perspective, this allows for the interpreter to use opcodes
which can *assume* the type of a value. For instance, suppose you want to add
two values. Without manifest types, you would need a `ADD` operation which
inspects the types of the values, and decides what to do accordingly. With
manifest types, however, you could implement an `ADD` operation which only
works for numbers, a separate `CONCAT` operation for strings, and a
`NUM_TO_STR` operation to convert numbers to strings. For example, the bytecode
for `one + $two` may look like:

```
# stack: []
GET_GLOBAL_INT &one
# stack: [1]
NUM_TO_STR
# stack: ["1"]
GET_GLOBAL_STR &two
# stack: ["1", "2"]
CONCAT
# stack: ["12"]
```

In other words, manifest types can help avoid `typeof` and `instanceof` checks
at runtime.

### The Decisions of MSX BASIC

Between `Modern MSX Game Development` and the
[MSX2 Technical Handbook](https://konamiman.github.io/MSX2-Technical-Handbook/md/Chapter2.html), we can discover these rules:

1. Integers in MSX BASIC have a `%` sigil.
2. Singles in MSX BASIC have a `!` sigil.
3. Doubles in MSX BASIC have a `#` sigil.
4. Strings in MSX BASIC have a `$` sigil.
5. In MSX BASIC, variables defined without a sigil have a *configurable*
   default type. For MSX this is initially configured to doubles, though it's
   common practice to change it to integers. This is widely considered to
   be a footgun.
6. Arrays and functions *by convention* have the same postfix sigils as their
   *return values* - but not always! While the syntax doesn't show their type
   in context, they are defined within the program using unambiguous syntax.
7. Channels aren't variables, but are *prefixed* with `#` when specified.
8. MSX BASIC doesn't have a dedicated boolean type. Instead, the integer `0`
   is treated as `false` and the integer `-1` is treated as `true`.
9. Variables of different types can reuse the same names. The correct variable
   is fetched based on the compiler's knowledge of the type.

## Decision

**This decision is incomplete. It's close, but I'm learning new things about
this problem over time.**

Matanuska BASIC will begin by broadly implementing the same decisions as
MSX BASIC, with the following differences:

1. Since we only support Reals, use the `!` sigil exclusively.
2. Do not implement default default types for identifiers without a sigil.
3. Booleans will use a `?` sigil.

## Deferred Decisions

### Untyped and Union Identifiers

There are cases where untyped or union identifiers would be useful. For
instance, many native functions in BASIC can accept union or any types.

One option is to list multiple sigils for union types. For instance, `ident%!`
could be a union of integers and reals. In this case, ordering may be a
linting rule.

Another option is to allow completely untyped identifiers. These are two major
options:

1. Use a dedicated sigil. Unfortunately, many of the natural sigils - such as
   `?` - are taken. `_` may work, if identifiers are modified to disallow that
   character at the end.
2. Use no sigil at all. Given the behavior of traditional BASICs of
   auto-assigning a type, this may be a natural choice. However, it's less
   explicit, and may discourage users from using types.

This decision will be deferred until functions are implemented, or there is
otherwise a use case for untyped or union identifiers.

### Types in Call Signatures

In the context of a program, the type of an array or function is unambiguous.
However, in the context of a call signature, they may be. There are a few
options:

1. Allow call signatures to be untyped. This appears to be the case with at
   least a few implementations of BASIC. While this is likely straightforward
   to implement, it may cause performance issues.
2. Implement prefix sigils for functions and arrays. There is already an
   example of prefix sigils for channels, and this would allow reuse of sigils
   already used in a postfix context.
3. Use sigils within a call syntax: `foo$(%)`. Combined with a prefix sigil,
   this may look like `@foo$(%)` or `&foo!($)`.

In addition, a callable may return a void type. One solution is to use no
return sigil in those cases.

This decision will be deferred until functions are implemented.
