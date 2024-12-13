# ADR ??? - Ideas from Fantasy Consoles

### Status: Draft

### Josh Holbrook

### Date: 2024-12-12

## Context

[fantasy](https://github.com/paladin-t/fantasy)

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

### atto

- repl: <https://atto.devicefuture.org/>
- "from basic" doc: <https://github.com/devicefuture/atto/blob/main/docs/frombasic.md>

"essentially BASIC, but with a few modern features added in"

- REPL syntax highlighting - can I highlight based on pure tokens?

`edit 10` can modify a line

`;` is the string concat operator - lol?

Atto treats sigils as typecasting parameters - `some_str%` will cast the string to an int.

### basic8

<https://paladin-t.github.io/b8/docs/manual>

EXTREMELY well documented!

> BASIC8 implements a BASIC dialect with retro simplicity, and tackles a lot of aspects of modern concepts.

- variables don't have types
  - sigil used to set whether the value of a dim is a number or a string
- types:
  - nil
  - numbers
    - 32-bit signed and IEE 754 singles
    - implicitly switches between them depending on whether or not there's a fractional part
  - string
  - type
  - array
  - collections
  - iterators
  - classes
  - routines
  - lambdas
  - coroutines
- falsey values:
  - 0
  - `FALSE` keyword
  - nil
  - `JSON_BOOL(FALSE)` (?)
- operators
  - `=` is equality - it can do that because of context
  - uses `+` for concat
  - bitwise ops are functions
- conditionals
  - `elseif` single keyword
- loops
  - `for`/`to`/`step`/`next` style for loops
  - `while`/`wend`
  - `do`/`until`
  - labels have a `:` sigil (apparently not used to separate statements)
- other data structures supported through functions
- routines
  - `def`/`enddef`
  - basically functions
  - variadic, using a `...` for remaining args - seems to act like a list
  - supports lambdas with `lambda` keyword
- classes
  - `class`/`endclass`
  - `NEW` function to create instance
  - dots to access properties
  - internal `var` and `def`s are exposed as properties
  - prototype-based under the hood
  - use parens to inherit
- `import` statements
- coroutines
  - `coroutine(<callable>)`
  - supports coroutine-like keywords

### click4

<https://github.com/josefnpat/click4>

Has a mouse-driven visual editor - not super relevant to us.

It also, however, has a bytecode spec: <https://github.com/josefnpat/click4/blob/master/docs.md> VERY simple. Not super relevant - cool project, though.

### MEG-4 BASIC

<https://bztsrc.gitlab.io/meg4/manual_en.html#basic>

Actually supports the `DATA` command. I should revisit this, learn how it actually works and consider implementing it.

Its `DIM`s can be up to 4 dimensions. Apparently some languages support `REDIM` to resize arrays, but meg4 does not.

Its GOTOs support labels - the language does NOT have line numbers. Honestly tempting to make the same decision.

The docs regularly reference a specification. Where can I find that?

Supports both subs and funcs.

Print and input statements use `;` to separate expressions. This is probably why atto uses it as a concat operator - that behavior is consistent with classic print.

Supports PEEK and POKE, and an address type. Not sure what that looks like for me, since I allocate on the heap.

Also has an ASM spec:

<https://bztsrc.gitlab.io/meg4/manual_en.html#assembly>

It has specific registers. I currently just have "a" and "b" in a closure in mine. But formalizing that could be good. Its registers are:

> - AC: accumulator register, with an integer value
> - AF: accumulator register, with a floating point value
> - FLG: processor flags (setup is done, blocked for I/O, blocked for timer, execution stopped)
> - TMR: the timer register's current value
> - DP: data pointer, this points to the top of the used global variable memory
> - BP: base pointer, marks the top of the function stack frame
> - SP: stack pointer, the bottom of the stack
> - CP: callstack pointer, the top of the callstack
> - PC: program counter, the address of the instruction currently being executed

Also a built-in gui debugger: <https://bztsrc.gitlab.io/meg4/manual_en.html#debugger>

### Micro16 and M16BASIC

<https://itch.io/t/966540/preliminary-manual>

An implementation of ECMA-55 BASIC with the following deviations:

- Identifiers allow more characters, including `_`, and can be 48 characters long
- Line end comments can be used with `#`
- Subroutines are given a label using the `proc` keyword - `$<ident>`
  - Call with `gosub $<ident>`

and a few additions, including:

- `peek` and `poke`
- `pause n` as a sleep mechanism
- `setreg <reg> <value>`

registers and system variables are special built-in values that are meant for
very fast access. registers are `xscroll` and `yscroll`, and system variables
include color info and the start address for vram.

### ECMA-55

- standard: <https://ecma-international.org/publications-and-standards/standards/ecma-55/>
- bas55 implementation: <https://jorgicor.niobe.org/bas55/bas55.html>

TK

### miniscript

<https://miniscript.org/>

Somewhat BASIC-ish, but:

- does not have sigils
- has objects
- has range iteration - powered by iterators?
- regular old lists
- javascript-ish objects
  - "a map with a special `__isa` entry"
  - " set automatically when you use the `new` operator
  - function properties get passed a `self` parameter, similar to JavaScript `this` but explicit like Python

### minicube64

<https://aeriform.gitbook.io/minicube64/start>

Appears to be a bytecode vm and a simple assembler language. Could be useful as a reference that influences my vm design.

Has a *very* interesting debug view that could be worth trying just to experience:

<https://aeriform.gitbook.io/minicube64/debug-view>

Registers are:

- PC
- SP
- A (accumulator)
- X
- Y
- VP (video register)
- P1 (input register)

### prequel

<https://prequel-lang.org/docs/primer/>

### Programmable Tile Machine

- project page: <https://github.com/FernandoAiresCastello/PTM>
- instruction set: <https://docs.google.com/spreadsheets/d/1uPhPh0LLgRmL87Uo9hDXGUhOOFIESIYAcZ_nJOlN2VI/edit?gid=1742699342#gid=1742699342>

It sits at a strange intersection between a VM and a full language. It's structured as instructions and parameters - no statements or expressions - however:

1. Instructions are VERY high level and have relatively readable names
2. Parameters can be identifiers and value literals

This is very cool!

### smile basic

<http://smilebasic.com/en/e-manual/>

A BASIC that runs on the Nintendo 3DS. Like, the VM boots on a 3ds.

It's largely a traditional BASIC, where most of the deviations are due to hardware restrictions on the 3DS. Not a particularly insightful reference. But cool.

## Decision

TK
