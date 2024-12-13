# ADR ??? - Assembler Language

### Status: Draft

### Josh Holbrook

## Context

Matanuska BASIC will be using a bytecode runtime. At a minimum this will require disassembly for debugging purposes. But it also suggests that it would be useful to develop a bytecode assembler as well.

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

## Notes from Fantasy Consoles

<https://github.com/paladin-t/fantasy>

### 3BC

<https://3bc-lang.org/guide/tutorial-en-us>

ASM-like. Some interesting ideas on how to structure an assembly language for Matanuska BASIC.

4 byte "register" (instruction), 4 byte "address", 1 value

```
[MODE] [NILL] [0d2]
```

Values are:

- ascii char
- decimal, octal, hex and binary numbers
- null byte
- "hash generator" `:some_hash` (act as labels, but generate an address)

### click4

- github: <https://github.com/josefnpat/click4>
- bytecode spec: <https://github.com/josefnpat/click4/blob/master/docs.md>

VERY simple.

### Programmable Tile Machine

- project page: <https://github.com/FernandoAiresCastello/PTM>
- instruction set: <https://docs.google.com/spreadsheets/d/1uPhPh0LLgRmL87Uo9hDXGUhOOFIESIYAcZ_nJOlN2VI/edit?gid=1742699342#gid=1742699342>

It sits at a strange intersection between a VM and a full language. It's structured as instructions and parameters - no statements or expressions - however:

1. Instructions are VERY high level and have relatively readable names
2. Parameters can be identifiers and value literals

This is very cool!

## Decision

TK
