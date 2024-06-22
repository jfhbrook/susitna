/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/disassembler.ts > TAP > expressions > -1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  1
-1  3  NEG
-1  4  POP
-1  5  NIL
-1  6  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > "hello world" > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  hello world
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > (1) > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  1
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 1 : 1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  1
-1  3  POP
-1  4  CONSTANT  1
-1  6  POP
-1  7  NIL
-1  8  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 1 + 1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  1
-1  3  CONSTANT  1
-1  5  ADD
-1  6  POP
-1  7  NIL
-1  8  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 123.456 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  123.456
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > 255 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  255
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > false > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  false
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > nil > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  NIL
-1  2  POP
-1  3  NIL
-1  4  RETURN
`

exports[`test/disassembler.ts > TAP > expressions > true > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  true
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > malformed lines > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
undefined  1  CONSTANT  hello world
undefined  3  POP
undefined  4  NIL
undefined  5  RETURN
`

exports[`test/disassembler.ts > TAP > missing constants > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  undefined
-1  3  POP
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print "hello world" > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  hello world
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print (1) > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  1
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print 1 + 1 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  1
-1  3  CONSTANT  1
-1  5  ADD
-1  6  PRINT
-1  7  NIL
-1  8  RETURN
`

exports[`test/disassembler.ts > TAP > print > print 123.456 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  123.456
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print 255 > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  255
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print false > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  false
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > print > print nil > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  NIL
-1  2  PRINT
-1  3  NIL
-1  4  RETURN
`

exports[`test/disassembler.ts > TAP > print > print true > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  CONSTANT  true
-1  3  PRINT
-1  4  NIL
-1  5  RETURN
`

exports[`test/disassembler.ts > TAP > simple program > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
100  1  CONSTANT  hello world
100  3  PRINT
200  4  CONSTANT  goodbye
200  6  PRINT
200  7  NIL
200  8  RETURN
`

exports[`test/disassembler.ts > TAP > unknown opcode > must match snapshot 1`] = `
=== Disassembly of <chunk>: ===
-1  1  Unknown opcode  0x2329
`
