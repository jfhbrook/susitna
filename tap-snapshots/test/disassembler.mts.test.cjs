/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/disassembler.mts > TAP > expressions > -1 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  1
-1  3  NEG
-1  4  POP
-1  5  NIL
-1  6  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > "hello world" > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  hello world
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > (1) > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  1
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > 1 : 1 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  1
-1  3  POP
-1  4  CONSTANT  1
-1  6  POP
-1  7  NIL
-1  8  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > 1 + 1 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  1
-1  3  CONSTANT  1
-1  5  ADD
-1  6  POP
-1  7  NIL
-1  8  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > 123.456 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  123.456
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > 255 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  255
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > false > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  false
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > nil > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  NIL
-1  2  POP
-1  3  NIL
-1  4  RETURN
`

exports[`test/disassembler.mts > TAP > expressions > true > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  true
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > malformed lines > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
undefined  1  CONSTANT  hello world
undefined  3  POP
undefined  4  NIL
undefined  5  RETURN
`

exports[`test/disassembler.mts > TAP > missing constants > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  undefined
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > print > i% = 1 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
100  1  CONSTANT    i%
100  3  CONSTANT    1
100  5  SET_GLOBAL  i%
100  7  NIL
100  8  RETURN
`

exports[`test/disassembler.mts > TAP > print > if true then print "true" else print "false" endif > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
100  1   CONSTANT       true
100  3   JUMP_IF_FALSE  3 -> 13
100  6   POP
100  7   CONSTANT       true
100  9   PRINT
100  10  JUMP           10 -> 17
100  13  POP
100  14  CONSTANT       false
100  16  PRINT
100  17  NIL
100  18  RETURN
`

exports[`test/disassembler.mts > TAP > print > let i% = 1 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
100  1  CONSTANT       i%
100  3  CONSTANT       1
100  5  DEFINE_GLOBAL  i%
100  7  NIL
100  8  RETURN
`

exports[`test/disassembler.mts > TAP > print > print "hello world" > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  hello world
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > print > print (1) > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  1
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > print > print 1 + 1 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  1
-1  3  CONSTANT  1
-1  5  ADD
-1  6  PRINT
-1  7  NIL
-1  8  RETURN
`

exports[`test/disassembler.mts > TAP > print > print 123.456 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  123.456
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > print > print 255 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  255
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > print > print false > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  false
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > print > print i% + 1 > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
100  1  CONSTANT    i%
100  3  GET_GLOBAL  i%
100  5  CONSTANT    1
100  7  ADD
`

exports[`test/disassembler.mts > TAP > print > print nil > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  NIL
-1  2  PRINT
-1  3  NIL
-1  4  RETURN
`

exports[`test/disassembler.mts > TAP > print > print true > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  CONSTANT  true
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.mts > TAP > simple program > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
100  1  CONSTANT  hello world
100  3  PRINT
200  4  CONSTANT  goodbye
200  6  PRINT
200  7  NIL
200  8  RETURN
`

exports[`test/disassembler.mts > TAP > unknown opcode > must match snapshot 1`] = `
=== Disassembly of <unknown>: ===
-1  1  Unknown opcode  0x2329
`
