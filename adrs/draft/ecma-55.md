# ADR ??? - The ECMA-55 Standard

### Status: Draft

### Josh Holbrook

## Context

I discovered in my research that there is an actually an old (and largely obsolete) ECMA standard for a minimal BASIC implementation, which can be found here:

<https://ecma-international.org/publications-and-standards/standards/ecma-55/>

This standard defines a relatively small and tight core for a BASIC implementation, and most traditional BASIC dialects were near-supersets of it.

I would like to read this standard; detail how Matanuska BASIC intends to adhere to the standard; describe how and why it would *deviate* from the standard; and discuss how the standard can inform a test suite.

### Implementations

I've discovered two [fantasy console](https://github.com/paladin-t/fantasy) implementations which discuss adherence to ECMA-55:

- [M16BASIC](https://itch.io/t/966540/preliminary-manual), which describes specific deviations from the standard
- [bas55](https://jorgicor.niobe.org/bas55/bas55.html), which purports to be spec-compliant and not much else

## Decision

TK
