/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/parser.ts > TAP > accidentally an entire semicolon > must match snapshot 1`] = `
<input>:<R1>:11 (at the beginning): error: Unexpected token ;
  print 1 + 1;
             ^
`

exports[`test/parser.ts > TAP > bare expression starting with an integer > must match snapshot 1`] = `
<input>:1:0: warning: Line numbers should be in factors of 10
  1 + 1
  ^
<input>:1:2: error: Unexpected token +
  1 + 1
    ^
`

exports[`test/parser.ts > TAP > load > load with no filename > must match snapshot 1`] = `
<input>:<R1>:4 (at the beginning): error: Missing argument 'filename'
  load
      ^
`

exports[`test/parser.ts > TAP > load > load with two positional arguments > must match snapshot 1`] = `
<input>:<R1>:5 (at the beginning): error: Unexpected argument
  load "./examples/001-hello-world.bas" "extra"
       ^
`

exports[`test/parser.ts > TAP > non-numbered expression (1 != 1) > must match snapshot 1`] = `
<input>:<R1>:6 (at the beginning): warning: Use \`<>\` instead of \`!=\` for equality
  (1 != 1)
        ^
`

exports[`test/parser.ts > TAP > non-numbered expression (1 = 1) > must match snapshot 1`] = `
<input>:<R1>:5 (at the beginning): warning: Use \`==\` instead of \`==\` for equality
  (1 = 1)
       ^
`

exports[`test/parser.ts > TAP > non-numbered invalid string escape > must match snapshot 1`] = `
<input>:<R1>:1 (at the beginning): warning: Invalid escape sequence \`\\q\` in string '\\q'
  '\\q'
   ^
`

exports[`test/parser.ts > TAP > numbered expression (1 != 1) > must match snapshot 1`] = `
<input>:100:10: warning: Use \`<>\` instead of \`!=\` for equality
  100 (1 != 1)
            ^
`

exports[`test/parser.ts > TAP > numbered expression (1 = 1) > must match snapshot 1`] = `
<input>:100:9: warning: Use \`==\` instead of \`==\` for equality
  100 (1 = 1)
           ^
`

exports[`test/parser.ts > TAP > numbered invalid string escape > must match snapshot 1`] = `
<input>:100:5: warning: Invalid escape sequence \`\\q\` in string '\\q'
  100 '\\q'
       ^
`

exports[`test/parser.ts > TAP > out of order program > must match snapshot 1`] = `
/home/josh/script.bas:100:0: warning: Line numbers should be in order
  100 print "goodbye"
  ^
`

exports[`test/parser.ts > TAP > print instruction > non-numbered, without arguments > must match snapshot 1`] = `
<input>:<R1>:5 (at the beginning): error: Unexpected token <EOF>
  print
       ^
`

exports[`test/parser.ts > TAP > print instruction > numbered, without arguments > must match snapshot 1`] = `
<input>:100:9: error: Unexpected token <EOF>
  100 print
           ^
`

exports[`test/parser.ts > TAP > program with a negative line number > must match snapshot 1`] = `
/home/josh/script.bas:<R2>:0 (after line 100): error: Expected line number
  -100 "foo"
  ^
`

exports[`test/parser.ts > TAP > program with non-numbered input > must match snapshot 1`] = `
/home/josh/script.bas:<R2>:0 (after line 100): error: Expected line number
  "foo"
  ^
`
