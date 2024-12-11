# ADR ??? - Stack Effects

### Status: Draft

### Josh Holbrook

## Context

The operations of the runtime will largely be stack-based. There is a strong need to test that these operations have the expected stack effects.

An example of how stack effects can be specified may be seen in the [Factor](https://github.com/factor/factor/blob/master/extra/rot13/rot13.factor#L6) language.

## Decision

Runtime tests will include a DSL for specifying the stack effects of given operations. Tests will be run given inputs that assert the expected stack effects.
