/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/compiler.ts > TAP > interactive compiler > expression > has the expected arguments 1`] = `
Array [
  Expression {
    "expression": StringLiteral {
      "value": "Hello",
    },
    "offsetEnd": -1,
    "offsetStart": -1,
  },
  Array [
    Chunk {
      "code": Array [
        0,
        0,
        25,
      ],
      "constants": Array [
        "Hello",
      ],
      "filename": "<unknown>",
      "lines": Array [
        100,
        100,
        100,
      ],
    },
  ],
]
`

exports[`test/compiler.ts > TAP > syntax errors > *1 > must match snapshot 1`] = `
<input>:<R1>:0 (after line 100): error: Invalid unary operator
  *1
  ^
`

exports[`test/compiler.ts > TAP > syntax errors > 1 $ 1 > must match snapshot 1`] = `
<input>:<R1>:0 (after line 100): error: Invalid binary operator
  1 $ 1
  ^
`
