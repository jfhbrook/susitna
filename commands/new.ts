import { ValueError } from '../exceptions';
import { formatter } from '../format';
import { New } from '../ast/instr';

import { CommandRunner, ReturnValue } from './base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default async function new_(
  this: CommandRunner,
  _new: New,
): Promise<ReturnValue> {
  const { executor } = this;
  let [filename] = this.args;
  if (!filename) {
    filename = 'untitled.bas';
  } else if (typeof filename !== 'string') {
    throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
  }
  executor.new(filename);
  return null;
}
