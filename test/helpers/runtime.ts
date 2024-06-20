import { Test } from 'tap';

import { Chunk } from '../../bytecode/chunk';
import { Runtime } from '../../runtime';
import { Value } from '../../value';

import { MockConsoleHost } from './host';

export interface ChunkTests {
  effect?: [Value[], Value[]];
  throws?: Error;
}

export function testChunk(t: Test, chunk: Chunk, tests: ChunkTests = {}): void {
  const [stackBefore, stackAfter] = tests.effect || [[], []];
  const host = new MockConsoleHost();
  const runtime = new Runtime(host);

  runtime.stack.stack = stackBefore;

  if (tests.throws) {
    t.throws(() => runtime.interpret(chunk), tests.throws);
    return;
  }

  runtime.interpret(chunk);

  t.matchSnapshot(host.outputStream.output);
  t.matchSnapshot(host.errorStream.output);

  t.same(runtime.stack.stack, stackAfter);
}
