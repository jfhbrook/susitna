# ADR ??? - Break-In and Debugging

### Status: Draft

### Josh Holbrook

## Context

A common feature of BASIC is "break-in" - that is, some way of pausing execution of the program and entering a debugger state. `Writing Interactive Compilers & Interpreters` considers this functionality crucial.

There are a few challenges here.

The first is to ensure that break-in happens at a safe location within execution of the bytecode. This may mean marking line boundaries with a special opcode.

The second is getting the `readline` module to play nice. You can intercept `ctrl-c` with it, but the ergonomics aren't great.

### MEG-4 BASIC

<https://bztsrc.gitlab.io/meg4/manual_en.html#assembly>

MEG-4 BASIC has a built-in debugger: <https://bztsrc.gitlab.io/meg4/manual_en.html#debugger>

### minicube64

<https://aeriform.gitbook.io/minicube64/start>

Minicube64 has a _very_ interesting debug view that could be worth trying just to experience:

<https://aeriform.gitbook.io/minicube64/debug-view>

## Decision

TK
