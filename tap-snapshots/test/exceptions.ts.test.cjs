/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/exceptions.ts > TAP > mergeParseErrors > merge a few nulls 1`] = `
null
`

exports[`test/exceptions.ts > TAP > mergeParseErrors > merge a warning and an error 1`] = `
Exception {
  "errors": Array [
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 100,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 0,
      "source": "100 print someFn(ident)",
      "traceback": null,
    },
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 300,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 2,
      "source": "300 print someFn(ident",
      "traceback": null,
    },
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 500,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 4,
      "source": "500 print someFn(ident)",
      "traceback": null,
    },
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 700,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 6,
      "source": "700 print someFn(ident",
      "traceback": null,
    },
  ],
  "exitCode": 70,
  "message": "",
  "traceback": null,
}
`

exports[`test/exceptions.ts > TAP > mergeParseErrors > merge a warning and null 1`] = `
ParseWarning {
  "message": "",
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 100,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 0,
      "source": "100 print someFn(ident)",
      "traceback": null,
    },
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 500,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 4,
      "source": "500 print someFn(ident)",
      "traceback": null,
    },
  ],
}
`

exports[`test/exceptions.ts > TAP > mergeParseErrors > merge a warning, an error and null 1`] = `
Exception {
  "errors": Array [
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 200,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 1,
      "source": "200 print someFn(ident)",
      "traceback": null,
    },
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 300,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 2,
      "source": "300 print someFn(ident",
      "traceback": null,
    },
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 600,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 5,
      "source": "600 print someFn(ident)",
      "traceback": null,
    },
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 700,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 6,
      "source": "700 print someFn(ident",
      "traceback": null,
    },
  ],
  "exitCode": 70,
  "message": "",
  "traceback": null,
}
`

exports[`test/exceptions.ts > TAP > mergeParseErrors > merge an error and null 1`] = `
ParseWarning {
  "message": "",
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 100,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 0,
      "source": "100 print someFn(ident)",
      "traceback": null,
    },
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 500,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 4,
      "source": "500 print someFn(ident)",
      "traceback": null,
    },
  ],
}
`

exports[`test/exceptions.ts > TAP > mergeParseErrors > merge two errors 1`] = `
Exception {
  "errors": Array [
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 300,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 2,
      "source": "300 print someFn(ident",
      "traceback": null,
    },
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 400,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 3,
      "source": "400 print someFn(ident",
      "traceback": null,
    },
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 700,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 6,
      "source": "700 print someFn(ident",
      "traceback": null,
    },
    SyntaxError: expected ) {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": false,
      "lineNo": 800,
      "message": "expected )",
      "offsetEnd": 23,
      "offsetStart": 22,
      "row": 7,
      "source": "800 print someFn(ident",
      "traceback": null,
    },
  ],
  "exitCode": 70,
  "message": "",
  "traceback": null,
}
`

exports[`test/exceptions.ts > TAP > mergeParseErrors > merge two warnings 1`] = `
ParseWarning {
  "message": "",
  "traceback": null,
  "warnings": Array [
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 100,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 0,
      "source": "100 print someFn(ident)",
      "traceback": null,
    },
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 200,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 1,
      "source": "200 print someFn(ident)",
      "traceback": null,
    },
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 500,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 4,
      "source": "500 print someFn(ident)",
      "traceback": null,
    },
    SyntaxWarning: identifier has no sigil {
      "cmdNo": null,
      "filename": "/home/josh/script.bas",
      "isLine": true,
      "lineNo": 600,
      "message": "identifier has no sigil",
      "offsetEnd": 18,
      "offsetStart": 17,
      "row": 5,
      "source": "600 print someFn(ident)",
      "traceback": null,
    },
  ],
}
`
