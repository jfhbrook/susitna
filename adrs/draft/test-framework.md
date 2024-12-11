# ADR ??? - BASIC Test Framework

### Status: Draft

### Josh Holbrook

## Context

Test-driven development is an important feature in modern programming environments. But it's also immediately useful for testing the functionality of the interpreter as well.

A few libraries which may be relevant:

- [tape](https://www.npmjs.com/package/tape) - A TAP harness which is small and flexible enough that I may be able to use it directly.
- [@tap/reporter](https://github.com/tapjs/tapjs/tree/main/src/reporter) - node-tap's reporter. Tape's reporting isn't very sophisticated - this may help improve the output with a low lift.

## Decision

I will implement a simple test framework for the BASIC interpreter. This will implement commands, such as `test` and `assert`, which collect TAP-like results when the interpreter is run in a "test" mode.

Details TK
