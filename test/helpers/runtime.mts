import { t } from './tap.mjs';

import { Exit } from '../../exit.mjs';
import { Chunk } from '../../bytecode/chunk.mjs';
import { formatter } from '../../format.mjs';
import { Runtime } from '../../runtime.mjs';
import { Value } from '../../value/index.mjs';

import { MockConsoleHost } from './host.mjs';

export interface ChunkTests {
  effect?: [Value[], Value[]];
  throws?: any;
  exitCode?: number;
}

export function testChunk(chunk: Chunk, tests: ChunkTests = {}): void {
  const [stackBefore, stackAfter] = tests.effect || [[], []];
  const host = new MockConsoleHost();
  const runtime = new Runtime(host);

  runtime.stack.stack = stackBefore;

  if (tests.throws) {
    t.throws(() => {
      try {
        runtime.interpret(chunk);
      } catch (err) {
        if (!(err instanceof Exit)) {
          t.matchSnapshot(formatter.format(err));
          throw err;
        }
      }
    }, tests.throws);
    return;
  }

  try {
    runtime.interpret(chunk);
  } catch (err) {
    t.equal(err.exitCode, tests.exitCode || 0);
  }

  t.matchSnapshot(host.outputStream.output);
  t.matchSnapshot(host.errorStream.output);

  t.same(runtime.stack.stack, stackAfter);
}
