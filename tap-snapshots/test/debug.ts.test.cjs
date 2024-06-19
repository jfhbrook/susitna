/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/debug.ts > TAP > tracer > must match snapshot 1`] = `
Array [
  Array [
    "\\u001b[32mTRACE\\u001b[39m <\\u001b[36mmain\\u001b[39m> before span\\u001b[90m at {CWD}/node_modules/@tapjs/core/src/test-base.ts:338:17\\u001b[39m",
  ],
  Array [
    "\\u001b[32mTRACE\\u001b[39m <\\u001b[36mmain\\u001b[39m> span\\u001b[90m at {CWD}/test/debug.ts:10:16\\u001b[39m",
  ],
  Array [
    "\\u001b[32mTRACE\\u001b[39m <\\u001b[36mmain\\u001b[39m> \\u001b[33m|- \\u001b[39minside span\\u001b[90m at {CWD}/test/debug.ts:10:16\\u001b[39m",
  ],
  Array [
    "\\u001b[32mTRACE\\u001b[39m <\\u001b[36mmain\\u001b[39m> after span\\u001b[90m at <unknown>\\u001b[39m",
  ],
  Array [
    "\\u001b[32mTRACE\\u001b[39m <\\u001b[36mmain\\u001b[39m> sync span\\u001b[90m at {CWD}/test/debug.ts:14:10\\u001b[39m",
  ],
  Array [
    "\\u001b[32mTRACE\\u001b[39m <\\u001b[36mmain\\u001b[39m> \\u001b[33m|- \\u001b[39minside sync span\\u001b[90m at {CWD}/test/debug.ts:14:10\\u001b[39m",
  ],
  Array [
    "\\u001b[32mTRACE\\u001b[39m <\\u001b[36mmain\\u001b[39m> after sync span\\u001b[90m at <unknown>\\u001b[39m",
  ],
]
`
