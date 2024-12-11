# ADR 004 - Expect Tests

### Status: Accepted

### Josh Holbrook

## Context

Effective interpreters need a lot of tests. One kind of test is an "expect" test - run a script, potentially enter input programmatically, and assert the output.

My test framework, node-tap, has a `matchSnapshot` functionality which can assert the output. Programmatic input is more complicated, and may require another module.

A type of test recommended by `Writing Interactive Compilers & Interpreters` includes running absurdly large programs and asserting they cause meaningful errors instead of segmentation faults or similar.

## Decision

I will write a series of test scripts in the test directory. A tap test will run each script and assert the output with `matchSnapshot`.

These scripts will initially not take input, since solving for "expect" use cases is more complicated. This may be tackled in the future.

There will also be (a) script(s) which generate absurdly large programs, which test the limits of the interpreter.
