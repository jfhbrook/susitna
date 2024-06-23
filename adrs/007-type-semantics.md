# ADR 007 - Type Semantics for Primary Types
### Status: Accepted
### Josh Holbrook

## Context

Matanuska is currently aware of the following types:

- integers
- reals
- booleans
- strings
- nil

It also supports a number of binary and unary operations, including math
operators (+, -, \*, /), logical operators (`and`, `or`, `not`), and various
comparison operators (==, <>, >, <, >=, <=).

In some cases, the behavior is easy and obvious. For example, adding two
integers together does the right thing by default. However, many other cases
are *not* obvious. For example, what should happen if you add an integer and
a string? Python will throw a `TypeError`, but JavaScript will cast the integer
to a string and concat the results.

In addition, cast to booleans (ie, "truthiness" and "falsiness") differs
significantly between languages.

This ADR attempts to iron out the expected semantics.

### Python Behavior

Python generally allows implicitly converting booleans to integers and integers
to floats. Its booleans cast to `0` for False and `1` for True. However, it
will not cast non-string values to strings.

Strings support `+` for concatenation, and comparison operators through
lexicographical sort order.

Python treats non-zero integer and float values as truthy. It treats empty
strings as falsey, and non-empty strings as truthy.

While arrays are out of scope of this discussion, Python also allows lists to
be concatenated with the `+` operator. It also seems to allow comparisons
through element-wise comparison similar to lexicographical sorts, and similarly
treats non-empty lists as truthy.

### JavaScript Behavior

JavaScript's behavior is subtly different from Python. The biggest difference
is that it will gleefully cast values to strings in order to make an operation
succeed. But its behavior in edge cases is tough to predict - often, you have
to try it to find out.

In terms of truthiness and boolean casts, JavaScript treats booleans and
numbers similarly to Python - though, note, it only has a `number` type, with
oddball semantics of its own. However, its philosophy for truthiness of string
and Array values differs significantly, in that any defined Object is truthy.

The trade-off is that Python allows you to check for empty strings/lists with
an `if value:` check, but requires `if value is not None` when definition is
important - JavaScript flips this, with `if (value.length) {` and
`if (value) {` respectively.

### MSX Behavior

Experimenting in an MSX emulator, MSX BASIC appears to cast ints to floats,
but does not cast values to string. Given its rudimentary capabilities, it's
not believed to have any interesting behavior in terms of its strings and
dims - typically, operations are achieved through piecewise iteration and
built-in functions.

It's worth noting that MSX BASIC treats non-zero integers and floats as
truthy, the same as Python and JavaScript, but defines FALSE and TRUE as
0 and -1, respectively. This is presumably because of some two's compiliment
behavior in signed values.

## Decision

Matanuska BASIC will implement behavior very similar to Python:

1. Casts between booleans, integers and floats will behave the same way as
   Python. This behavior is consistent across all three languages discussed,
   and is non-controversial.
2. Numerical values will not be implicitly cast to strings. This behavior
   causes a lot of confusion in JavaScript, and not allowing it is also
   consistent with MSX BASIC.
3. Strings will support concatenation with the `+` operator, and comparison
   by lexicographical sort order. There's no particularly good reason *not* to
   support this operator, and JavaScript already implements the right sort
   order for strings.
4. Non-zero number-like values and non-empty strings will be treated as truthy.
   Zero number-like values, empty strings and `nil` will be treated as falsey.

Array behavior is considered out of scope for this ADR, though their behavior
will likely be consistent with strings.
