import { Test } from 'tap';

import { Chunk } from '../../bytecode/chunk';
import { Runtime } from '../../runtime';
import { Value } from '../../value';

import { MockConsoleHost } from './host';

export interface ChunkTests {
  effect?: [Value[], Value[]];
  throws?: Error;
  exitCode?: number;
}

export function testChunk(t: Test, chunk: Chunk, tests: ChunkTests = {}): void {
  const [stackBefore, stackAfter] = tests.effect || [[], []];
  const host = new MockConsoleHost();
  const runtime = new Runtime(host);
  let exitCode: number | undefined;

  runtime.stack.stack = stackBefore;

  if (tests.throws) {
    t.throws(() => runtime.interpret(chunk), tests.throws);
    return;
  }

  runtime.on('exit', (code) => {
    exitCode = code;
  });

  runtime.interpret(chunk);

  t.matchSnapshot(host.outputStream.output);
  t.matchSnapshot(host.errorStream.output);

  t.same(runtime.stack.stack, stackAfter);

  if (tests.exitCode) {
    t.equal(exitCode, tests.exitCode);
  }
}
