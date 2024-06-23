/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/parser.ts > TAP > bare expression starting with an integer > must match snapshot 1`] = `
<input>:1:0: warning: Line numbers should be in factors of 10
  1 + 1
  ^
<input>:1:2: error: Unexpected token +
  1 + 1
    ^
`

exports[`test/parser.ts > TAP > non-numbered expression (1 != 1) > must match snapshot 1`] = `
ParseWarning {
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: Use \`<>\` instead of \`!=\` for equality {
      "filename": "<input>",
      "isLine": false,
      "lineNo": null,
      "offsetEnd": 7,
      "offsetStart": 6,
      "row": 1,
      "source": "(1 != 1)",
      "traceback": null,
    },
  ],
}
`

exports[`test/parser.ts > TAP > non-numbered expression (1 = 1) > must match snapshot 1`] = `
ParseWarning {
  "message": "",
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: Use \`==\` instead of \`==\` for equality {
      "filename": "<input>",
      "isLine": false,
      "lineNo": null,
      "message": "Use \`==\` instead of \`==\` for equality",
      "offsetEnd": 6,
      "offsetStart": 5,
      "row": 1,
      "source": "(1 = 1)",
      "traceback": null,
    },
  ],
}
`

exports[`test/parser.ts > TAP > non-numbered invalid string escape > must match snapshot 1`] = `
<input>:<R1>:1 (at the beginning): warning: Invalid escape sequence \`\\q\` in string '\\q'
  '\\q'
   ^
`

exports[`test/parser.ts > TAP > numbered expression (1 != 1) > must match snapshot 1`] = `
ParseWarning {
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: Use \`<>\` instead of \`!=\` for equality {
      "filename": "<input>",
      "isLine": true,
      "lineNo": 100,
      "offsetEnd": 11,
      "offsetStart": 10,
      "row": 1,
      "source": "100 (1 != 1)",
      "traceback": null,
    },
  ],
}
`

exports[`test/parser.ts > TAP > numbered expression (1 = 1) > must match snapshot 1`] = `
ParseWarning {
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: Use \`==\` instead of \`==\` for equality {
      "filename": "<input>",
      "isLine": true,
      "lineNo": 100,
      "offsetEnd": 10,
      "offsetStart": 9,
      "row": 1,
      "source": "100 (1 = 1)",
      "traceback": null,
    },
  ],
}
`

exports[`test/parser.ts > TAP > numbered invalid string escape > must match snapshot 1`] = `
<input>:100:5: warning: Invalid escape sequence \`\\q\` in string '\\q'
  100 '\\q'
       ^
`

exports[`test/parser.ts > TAP > out of order program > must match snapshot 1`] = `
ParseWarning {
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: Line numbers should be in order {
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 100,
      "offsetEnd": 3,
      "offsetStart": 0,
      "row": 2,
      "source": "100 print \\"goodbye\\"",
      "traceback": null,
    },
  ],
}
`

exports[`test/parser.ts > TAP > print command > non-numbered, without arguments > must match snapshot 1`] = `
<input>:<R1>:5 (at the beginning): error: Unexpected token <EOF>
  print
       ^
`

exports[`test/parser.ts > TAP > print command > numbered, without arguments > must match snapshot 1`] = `
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
