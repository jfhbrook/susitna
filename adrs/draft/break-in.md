# ADR ??? - Break-In
### Status: Draft
### Josh Holbrook

## Context

A common feature of BASIC is "break-in" - that is, some way of pausing
execution of the program and entering a debugger state. `Writing Interactive
Compilers & Interpreters` considers this functionality crucial.

There are a few challenges here.

The first is to ensure that break-in happens at a safe location within
execution of the bytecode. This may mean marking line boundaries with a
special opcode.

The second is getting the `readline` module to play nice. You can intercept
`ctrl-c` with it, but the ergonomics aren't great.

## Decision

TK
