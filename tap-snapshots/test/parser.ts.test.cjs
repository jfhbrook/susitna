/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/parser.ts > TAP > non-numbered invalid string escape > must match snapshot 1`] = `
<input>:<R1>:1 (at the beginning): warning: Invalid escape sequence \`\\q\` in string '\\q'
  '\\q'
   ^
`

exports[`test/parser.ts > TAP > non-numbered print command without arguments > must match snapshot 1`] = `
<input>:<R1>:5 (at the beginning): error: Unexpected token <EOF>
  print
       ^
`

exports[`test/parser.ts > TAP > numbered invalid string escape > must match snapshot 1`] = `
<input>:100:5: warning: Invalid escape sequence \`\\q\` in string '\\q'
  100 '\\q'
       ^
`

exports[`test/parser.ts > TAP > numbered print command without arguments > must match snapshot 1`] = `
<input>:100:9: error: Unexpected token <EOF>
  100 print
           ^
`

exports[`test/parser.ts > TAP > program with non-numbered input > must match snapshot 1`] = `
/home/josh/script.bas:<R2>:0 (after line 100): error: Expected line number
  "foo"
  ^
`
