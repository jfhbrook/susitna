# ADR ??? - Objects

### Status: Draft

### Josh Holbrook

## Context

I'd eventually like to consider supporting objects in Matanuska BASIC. But a traditional BASIC doesn't support objects, so we'd be a little off the beaten path.

### Lua

Lua is interesting because it uses a `Table` type for most collection types, as well as objects.

### miniscript

[Miniscript](https://miniscript.org/) is a vaguely BASIC-like language for a fantasy console. It has an interesting object implementation that's reminiscent of Lua. In Miniscript, an object is a map with a special `__isa` entry", that is "set automatically when you use the `new` operator." Functions can be assigned to properties, which - when called - will be passed a `self` parameter. The binding mechanics are similar to JavaScript, but it's (like Python) an explicit parameter.

### BASIC8

[BASIC8](https://paladin-t.github.io/b8/docs/manual) also has an interesting class implementation. It uses prototypes under the hood, similar to JavaScript, and has a syntax like so:

```bas
CLASS foo
	VAR a = 1
	DEF fun(b)
		RETURN a + b
	ENDDEF
ENDCLASS
CLASS bar(foo)
	VAR a = 2
ENDCLASS
inst = NEW(bar)
PRINT inst.fun(3);
```

The `ME` keyword references the current class, like `self` or `this`. Attribute access uses a `.` operator. But most other operations are supported through functions.

## Decision

TK
