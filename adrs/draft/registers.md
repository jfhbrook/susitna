# ADR ??? - Registers

### Status: Draft

### Josh Holbrook

## Context

Typically, a hardware architecture has a fixed set of registers. It's not unusual for bytecode VMs to have registers as well, though `clox` in _Crafting Interpreters_ stores values on the C stack with scope.

Matanuska BASIC currently has a *program counter* (`PC`) and will eventually have a *stack pointer* (`SP`) as well. But its current use of "registers" is two `Value`s "a" and "b" stored in the scope of the switch-loop.

Long term, it could be good (and fun) to specify the registers and their semantics.

### MEG-4 BASIC

<https://bztsrc.gitlab.io/meg4/manual_en.html#assembly>

MEG-4 BASIC has a specified VM and assembly language which supports the following registers:

> - AC: accumulator register, with an integer value
> - AF: accumulator register, with a floating point value
> - FLG: processor flags (setup is done, blocked for I/O, blocked for timer, execution stopped)
> - TMR: the timer register's current value
> - DP: data pointer, this points to the top of the used global variable memory
> - BP: base pointer, marks the top of the function stack frame
> - SP: stack pointer, the bottom of the stack
> - CP: callstack pointer, the top of the callstack
> - PC: program counter, the address of the instruction currently being executed

### minicube64

<https://aeriform.gitbook.io/minicube64/start>

Minicube64 has the following registers:

- PC
- SP
- A (accumulator)
- X
- Y
- VP (video register)
- P1 (input register)

I believe the registers store raw bytes, not `Value`s.

### Programmable Tile Machine

- project page: <https://github.com/FernandoAiresCastello/PTM>
- instruction set: <https://docs.google.com/spreadsheets/d/1uPhPh0LLgRmL87Uo9hDXGUhOOFIESIYAcZ_nJOlN2VI/edit?gid=1742699342#gid=1742699342>

Programmable Tile Machine does not specify registers. However, it *does* act as an example of an instruction set VM which deals with full `Value`s stored in values or references.

## Decision

TK
