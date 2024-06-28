import { basename } from 'path';

import t from 'tap';
import { Test } from 'tap';

import { run, EXAMPLES } from './helpers/cli';

t.test('examples', async (t: Test) => {
  for (const example of EXAMPLES) {
    await t.test(basename(example), async (t: Test) => {
      const { exitCode, host } = await run([example], process.env);
      t.matchSnapshot({
        exitCode,
        stdout: host.outputStream.output,
        stderr: host.errorStream.output,
      });
    });
  }
});
