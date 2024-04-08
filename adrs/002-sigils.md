# ADR 002 - Sigils
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
6. Arrays and functions have the same postfix sigils as their *return values*.
   While the syntax doesn't show their type in context, they are defined within
   the program using unambiguous syntax.
7. Channels aren't variables, but are *prefixed* with `#` when specified.
8. MSX BASIC doesn't have a dedicated boolean type. Instead, the integer `0`
   is treated as `false` and the integer `-1` is treated as `true`.

## Decision

Matanuska BASIC will begin by broadly implementing the same decisions as
MSX BASIC. However, it will not implement default default types for identifiers
without a sigil.
