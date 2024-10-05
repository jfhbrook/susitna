# ADR ??? - Native Hash Support

### Status: Draft

### Josh Holbrook

## Context

Traditional BASIC doesn't support hashes (also known as maps, dictionaries
or associative arrays) natively. Typically, developers would implement
dictionaries by having two arrays, one for keys and one for values. To look
up a value, one would scan the keys array for the key, then use its array
index to look up the corresponding value.

It may be tempting to look to Visual Basic for how it supports hash types.
However, it doesn't have a native syntax for hashes either. Instead, it handles
them with
[classes](https://learn.microsoft.com/en-us/dotnet/api/system.collections.hashtable?view=net-8.0&redirectedfrom=MSDN),
namely `HashTable` and `Dictionary`.

There are a number of options under consideration:

1. Extending arrays to include an associative array. This would require
   a syntax extension to declaring a `dim` to indicate that an index is
   string valued.
2. Implementing a separate hash or map type.

Related is the problem of implementing objects. Objects in JavaScript have
hash-like semantics, and in fact are used as hashes for most problems.
Similarly, [Lua tables](https://www.lua.org/pil/2.5.html) implement integer
indexed arrays, string associative arrays and Objects all in one abstraction.

## Decision

TK
