import { basename } from 'path';

import t from 'tap';
import { Test } from 'tap';

import { run } from './helpers/cli';
import { EXAMPLES } from './helpers/files';

t.test('examples', async (t: Test) => {
  for (const path of Object.keys(EXAMPLES)) {
    const name = basename(path);
    switch (name) {
      // TODO: Some scripts will need mocked input
      default:
        await t.test(name, async (t: Test) => {
          const { exitCode, host } = await run([path], process.env);
          t.matchSnapshot({
            exitCode,
            stdout: host.outputStream.output,
            stderr: host.errorStream.output,
          });
        });
    }
  }
});
