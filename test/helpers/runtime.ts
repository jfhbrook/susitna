interface Test {
  throws(fn: () => any, err: any): any;
  equal(actual: any, expected: any, message?: string): any;
  matchSnapshot(actual: any): any;
  same(actual: any, expected: any): any;
}

import { Exit } from '../../exit';
import { Chunk } from '../../bytecode/chunk';
import { formatter } from '../../format';
import { Runtime } from '../../runtime';
import { Value } from '../../value';

import { MockConsoleHost } from './host';

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
