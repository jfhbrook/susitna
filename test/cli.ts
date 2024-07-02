import { readFileSync } from 'fs';

import t from 'tap';
import { Test } from 'tap';

import { run } from './helpers/cli';
import { EXAMPLES } from './helpers/files';

const TEST_CASES = Object.entries(EXAMPLES).map(([name, path]) => {
  switch (name) {
    // TODO: Some scripts will need mocked input
    default:
      return [name, path];
  }
});

t.test('examples', async (t: Test) => {
  for (const [name, path] of TEST_CASES) {
    await t.test(name, async (t: Test) => {
      const { exitCode, host } = await run([path], process.env, {
        files: Object.fromEntries(
          TEST_CASES.map(([_, path]) => {
            return [path, readFileSync(path, 'utf8')];
          }),
        ),
      });
      t.matchSnapshot({
        exitCode,
        stdout: host.outputStream.output,
        stderr: host.errorStream.output,
      });
    });
  }
});
