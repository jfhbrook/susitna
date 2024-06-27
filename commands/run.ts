import { Run } from '../ast/cmd';
import { CommandRunner, ReturnValue } from './base';

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
