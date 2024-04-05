/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseException > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
BaseException: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseFault > must match snapshot 1`] = `
=== INTERNAL FAULT ===

--- Internal Stack Trace ---
BaseFault: message
    at Test.<anonymous> ({CWD}/test/format.ts:222:40)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.cb ({CWD}/node_modules/@tapjs/core/src/test-base.ts:338:17)
    at <anonymous> ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1151:21)
    at Test.main ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1159:7)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.runMain ({CWD}/node_modules/@tapjs/core/src/base.ts:591:15)
    at Test.runMain ({CWD}/node_modules/@tapjs/test/test-built/src/index.ts:78:19)
    at Test.#processSubtest ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1228:9)
    at Test.#process ({CWD}/node_modules/@tapjs/core/src/test-base.ts:879:29)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseWarning > must match snapshot 1`] = `
/home/josh/script.bas:100: BaseWarning: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseWarning without a traceback > must match snapshot 1`] = `
<unknown>:<?>: BaseWarning: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a boolean > must match snapshot 1`] = `
true
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Cmd > must match snapshot 1`] = `
Print('hello')
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Code > must match snapshot 1`] = `
Code('/home/josh/script.bas')
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a FileError with one file > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
FileError EACCES: message
  Input File: /home/josh/script.bas
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a FileError with two files > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
FileError EACCES: message
  Source File: /home/josh/script.bas
  Destination File: another.bas
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Frame > must match snapshot 1`] = `
Frame(Code('/home/josh/script.bas'))
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Line > must match snapshot 1`] = `
Line(100) [
  Print('hello world'),
]
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a native value > must match snapshot 1`] = `
Set(3) { 'a', 'b', 'c' }
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a number > must match snapshot 1`] = `
12345
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Program > must match snapshot 1`] = `
Program(
  Line(100) [
    Print('hello world'),
  ],
)
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a RuntimeFault > must match snapshot 1`] = `
=== RUNTIME FAULT ===

--- Internal Stack Trace ---
AssertionError [ERR_ASSERTION]: underlying assertion
    at new AssertionError (node:internal/assert/assertion_error:451:5)
    at Test.<anonymous> ({CWD}/test/format.ts:226:26)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.cb ({CWD}/node_modules/@tapjs/core/src/test-base.ts:338:17)
    at <anonymous> ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1151:21)
    at Test.main ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1159:7)
    at TapWrap.runInAsyncScope (node:async_hooks:206:9)
    at Test.runMain ({CWD}/node_modules/@tapjs/core/src/base.ts:591:15)
    at Test.runMain ({CWD}/node_modules/@tapjs/test/test-built/src/index.ts:78:19)
    at Test.#processSubtest ({CWD}/node_modules/@tapjs/core/src/test-base.ts:1228:9)

--- Traceback ---
Traceback:
  File '/home/josh/script.bas', line 100

--- Versions ---
Matanuska BASIC: v0.0.1
TypeScript: v5.3.3
Node.js: v21.6.1

This is a bug in Matanuska BASIC. If you copy this entire message and post it
to the issues tracker:

    https://github.com/jfhbrook/matanuska/issues

the developers will do their best to fix it - and more importantly, they will
owe you a beer, coffee or beverage of your choice. 🍻


`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a string > must match snapshot 1`] = `
hello
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Token > must match snapshot 1`] = `
Token(<string>) {
  index: 0,
  row: 0,
  offsetStart: 0,
  offsetEnd: 9,
  text: "'hello\\q'",
  warnings:
    /home/josh/script.bas:<R0>:6 (at the beginning): warning: Invalid escape sequence \`\\q\`
      'hello\\q'
           ^
  value: 'hello\\q',
}
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a Traceback > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a UsageFault > must match snapshot 1`] = `
Usage: lol
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an AssertionError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
AssertionError: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an Exit > must match snapshot 1`] = `
message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an Expr > must match snapshot 1`] = `
'hello'
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an OsError > must match snapshot 1`] = `
Traceback:
  File '/home/josh/script.bas', line 100
OsError EADDRINUSE: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a ParseError > must match snapshot 1`] = `
/home/josh/script.bas:100:22: error: expected )
  100 print someFn(ident
                       ^
/home/josh/script.bas:100:17: warning: identifier has no sigil
  100 print someFn(ident
                  ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a ParseWarning > must match snapshot 1`] = `
/home/josh/script.bas:100:17: warning: identifier has no sigil
  100 print someFn(ident
                  ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a SyntaxError > must match snapshot 1`] = `
/home/josh/script.bas:100:22: error: expected )
  100 print someFn(ident
                       ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is a line > it formats a SyntaxWarning > must match snapshot 1`] = `
/home/josh/script.bas:100:22: warning: expected )
  100 print someFn(ident
                       ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a ParseError > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): error: expected )
  print someFn(ident
                       ^
/home/josh/script.bas:<R0>:17 (after line 100): warning: identifier has no sigil
  print someFn(ident
                  ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a ParseWarning > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:17 (after line 100): warning: identifier has no sigil
  print someFn(ident
                  ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a SyntaxError > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): error: expected )
  print someFn(ident
                       ^
`

exports[`test/format.ts > TAP > given a DefaultFormatter > when it is not a line > it formats a SyntaxWarning > must match snapshot 1`] = `
/home/josh/script.bas:<R0>:22 (after line 100): warning: expected )
  print someFn(ident
                       ^
`
