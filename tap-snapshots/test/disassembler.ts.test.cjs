/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/disassembler.ts > TAP > expressions > -1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  1
0  3  NEG
0  4  POP
0  5  NIL
0  6  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > "hello world" > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  hello world
0  3  POP
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > (1) > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  1
0  3  POP
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 1 : 1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  1
0  3  POP
0  4  CONSTANT  1
0  6  POP
0  7  NIL
0  8  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 1 + 1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  1
0  3  CONSTANT  1
0  5  ADD
0  6  POP
0  7  NIL
0  8  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 123.456 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  123.456
0  3  POP
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 255 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  255
0  3  POP
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > false > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  false
0  3  POP
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > nil > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  NIL
0  2  POP
0  3  NIL
0  4  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > true > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  true
0  3  POP
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print "hello world" > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  hello world
0  3  PRINT
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print (1) > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  1
0  3  PRINT
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print 1 + 1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  1
0  3  CONSTANT  1
0  5  ADD
0  6  PRINT
0  7  NIL
0  8  RETURN
`

exports[`test/disassembler.ts > TAP > print > print 123.456 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  123.456
0  3  PRINT
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print 255 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  255
0  3  PRINT
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print false > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  false
0  3  PRINT
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print nil > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  NIL
0  2  PRINT
0  3  NIL
0  4  RETURN
`

exports[`test/disassembler.ts > TAP > print > print true > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  true
0  3  PRINT
0  4  NIL
0  5  RETURN
`

exports[`test/disassembler.ts > TAP > simple program > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
0  1  CONSTANT  hello world
0  3  PRINT
0  4  CONSTANT  goodbye
0  6  PRINT
0  7  NIL
0  8  RETURN
`
