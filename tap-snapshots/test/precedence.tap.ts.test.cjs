/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/precedence.tap.ts > TAP > operator precedence > 9 + 8 * -7 > 6 / 5 and 4 == 3 or 2 - 1 > must match snapshot 1`] = `
Logical {
  "left": Logical {
    "left": Binary {
      "left": Binary {
        "left": IntLiteral {
          "value": 9,
        },
        "op": "+",
        "right": Binary {
          "left": IntLiteral {
            "value": 8,
          },
          "op": "*",
          "right": Unary {
            "expr": IntLiteral {
              "value": 7,
            },
            "op": "-",
          },
        },
      },
      "op": ">",
      "right": Binary {
        "left": IntLiteral {
          "value": 6,
        },
        "op": "/",
        "right": IntLiteral {
          "value": 5,
        },
      },
    },
    "op": "and",
    "right": Binary {
      "left": IntLiteral {
        "value": 4,
      },
      "op": "==",
      "right": IntLiteral {
        "value": 3,
      },
    },
  },
  "op": "or",
  "right": Binary {
    "left": IntLiteral {
      "value": 2,
    },
    "op": "-",
    "right": IntLiteral {
      "value": 1,
    },
  },
}
`

exports[`test/precedence.tap.ts > TAP > operator precedence > 9 + 8 * -7 > 6 / 5 and 4 == 3 or 2 - 1 > must match snapshot 2`] = `
null
`
