/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/cli.tap.ts > TAP > examples > 001-hello-world.bas > must match snapshot 1`] = `
Object {
  "exitCode": 0,
  "stderr": "",
  "stdout": String(
    hello world
    goodbye world
    
  ),
}
`

exports[`test/cli.tap.ts > TAP > examples > 002-invalid-line-number.bas > must match snapshot 1`] = `
Object {
  "exitCode": 70,
  "stderr": String(
    /home/josh/matanuska/examples/002-invalid-line-number.bas:<R3>:0 (after line 20): error: Expected line number
      "foo"
      ^
    
  ),
  "stdout": "",
}
`

exports[`test/cli.tap.ts > TAP > examples > 003-if.bas > must match snapshot 1`] = `
Object {
  "exitCode": 0,
  "stderr": "",
  "stdout": String(
    1 + 1 is 2!
    1 + 1 remains equal to 2!
    still 2!
    
  ),
}
`

exports[`test/cli.tap.ts > TAP > examples > 004-if-else.bas > must match snapshot 1`] = `
Object {
  "exitCode": 0,
  "stderr": "",
  "stdout": "else if\\n",
}
`

exports[`test/cli.tap.ts > TAP > examples > 005-open-block.bas > must match snapshot 1`] = `
Object {
  "exitCode": 0,
  "stderr": String(
    /home/josh/matanuska/examples/005-open-block.bas:40:4: error: else has not been closed
      40  else
          ^
    
  ),
  "stdout": "",
}
`
