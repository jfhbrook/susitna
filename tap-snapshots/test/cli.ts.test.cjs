/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/cli.ts > TAP > examples > 001-hello-world.bas > must match snapshot 1`] = `
Object {
  "exitCode": 0,
  "stderr": "",
  "stdout": String(
    hello world
    goodbye world
    
  ),
}
`

exports[`test/cli.ts > TAP > examples > 002-invalid-line-number.bas > must match snapshot 1`] = `
Object {
  "exitCode": 70,
  "stderr": String(
    {CWD}/examples/002-invalid-line-number.bas:<R3>:0 (after line 20): error: Expected line number
      "foo"
      ^
    
  ),
  "stdout": "",
}
`
