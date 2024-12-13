# ADR ??? - Dynamic Array Allocation

### Status: Draft

### Josh Holbrook

## Context

In traditional BASIC, arrays are pre-allocated in either one or two dimensions. For example, this would define a 3x3 array:

```basic
100 DIM A%(3, 3)
```

In a modern language, it would be nice to have dynamically sized arrays. In Visual Basic, this is accomplished syntactically by omitting the size completely. Two dimensional arrays are accomplished with a bare comma:

```vb
Dim A(,) AS Integer
```

This problem has some overlap with support for associative arrays. If we implement a separate type for hashes, then there's no need to change the way arrays work. However, if we _do_ support associative arrays, then extending the language syntax will be required.

One option is to use the corresponding sigil in the index:

```basic
REM Standard integer array
dim A(%)
REM String associative array
dim B($)
```

### MEG-4 BASIC

<https://bztsrc.gitlab.io/meg4/manual_en.html#basic>

These docs note that some languages support a `REDIM` command that can resize arrays. MEG-4 doesn't itself support that command - its arrays are fully static. But it's an interesting suggestion.

## Decision

TK
