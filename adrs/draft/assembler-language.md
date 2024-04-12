# ADR ??? - Assembler Language
### Status: Draft
### Josh Holbrook

## Context

Matanuska BASIC will be using a bytecode runtime. At a minimum this will
require disassembly for debugging purposes. But it also suggests that it would
be useful to develop a bytecode assembler as well.

Architecturally, these would mirror the BASIC scanner, parser and recreator.

One option is a fluent DSL, something like:

```js
const a = iConst(1);
const b = iConst(2);

export iPushConst(a)
  .iPushConst(b)
  .iAdd()
  .print(1)
  .ret();
```

## Decision

TK
