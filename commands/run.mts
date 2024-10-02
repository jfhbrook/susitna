import { Run } from '../ast/instr.mjs';

import { CommandRunner, ReturnValue } from './base.mjs';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default async function run(
  this: CommandRunner,
  _run: Run,
): Promise<ReturnValue> {
  const { executor } = this;
  await executor.run();
  return null;
}
