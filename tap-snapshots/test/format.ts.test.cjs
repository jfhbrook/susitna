/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseException > must match snapshot 1`] = `
Traceback:
  File "./script.bas", line 100
BaseException: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a BaseFault > must match snapshot 1`] = `
BaseFault: message
    at Test.<anonymous> ({CWD}/test/format.ts:139:40)
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
Traceback:
  File "./script.bas", line 100
BaseWarning: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a boolean > must match snapshot 1`] = `
true
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a FileError > must match snapshot 1`] = `
Traceback:
  File "./script.bas", line 100
FileError: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a number > must match snapshot 1`] = `
12345
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a ParseError > must match snapshot 1`] = `
ParseError: 
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a ParseWarning > must match snapshot 1`] = `
ParseWarning: 
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a RuntimeFault > must match snapshot 1`] = `
RuntimeFault: Some runtime fault
    at Test.<anonymous> ({CWD}/test/format.ts:152:11)
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

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a string > must match snapshot 1`] = `
hello
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a SyntaxError > must match snapshot 1`] = `
SyntaxError: expected )
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a SyntaxWarning > must match snapshot 1`] = `
SyntaxWarning: expected )
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats a UsageFault > must match snapshot 1`] = `
UsageFault: Usage: lol
    at Test.<anonymous> ({CWD}/test/format.ts:158:40)
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

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an AssertionError > must match snapshot 1`] = `
Traceback:
  File "./script.bas", line 100
AssertionError: message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an Exit > must match snapshot 1`] = `
message
`

exports[`test/format.ts > TAP > given a DefaultFormatter > it formats an OsError > must match snapshot 1`] = `
Traceback:
  File "./script.bas", line 100
OsError: message
`
