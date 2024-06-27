import { ValueError } from '../exceptions';
import { formatter } from '../format';
import { Save } from '../ast/cmd';
import { CommandRunner, ReturnValue } from './base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default async function save(
  this: CommandRunner,
  _save: Save,
): Promise<ReturnValue> {
  const { executor } = this;
  const [filename] = this.args;
  if (filename !== null && typeof filename !== 'string') {
    throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
  }
  await executor.save(filename);
  return null;
}
