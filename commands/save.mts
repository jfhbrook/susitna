import { ValueError } from '../exceptions.mjs';
import { formatter } from '../format.mjs';

import { Save } from '../ast/instr.mjs';

import { CommandRunner, ReturnValue } from './base.mjs';

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
