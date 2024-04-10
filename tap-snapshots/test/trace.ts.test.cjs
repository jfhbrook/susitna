/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/trace.ts > TAP > tracer > must match snapshot 1`] = `
Array [
  Array [
    "TRACE <main> before span",
  ],
  Array [
    "TRACE <main> span",
  ],
  Array [
    "TRACE <main> |- inside span",
  ],
  Array [
    "TRACE <main> after span",
  ],
  Array [
    "TRACE <main> sync span",
  ],
  Array [
    "TRACE <main> |- inside sync span",
  ],
  Array [
    "TRACE <main> after sync span",
  ],
]
`
