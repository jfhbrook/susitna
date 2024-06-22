import { Test } from 'tap';

import { Chunk } from '../../bytecode/chunk';
import { formatter } from '../../format';
import { Runtime } from '../../runtime';
import { Value } from '../../value';

import { MockConsoleHost, MockExit } from './host';

export interface ChunkTests {
  effect?: [Value[], Value[]];
  throws?: any;
  exitCode?: number;
}

export function testChunk(t: Test, chunk: Chunk, tests: ChunkTests = {}): void {
  const [stackBefore, stackAfter] = tests.effect || [[], []];
  const host = new MockConsoleHost();
  const runtime = new Runtime(host);

  runtime.stack.stack = stackBefore;

  if (tests.throws) {
    t.throws(() => {
      try {
        runtime.interpret(chunk);
      } catch (err) {
        if (!(err instanceof MockExit)) {
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
