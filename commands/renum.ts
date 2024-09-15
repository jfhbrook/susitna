import { Renum } from '../ast/instr';
import { CommandRunner, ReturnValue } from './base';

/**
 * List the current program.
 */
export default async function renum(
  this: CommandRunner,
  _renum: Renum,
): Promise<ReturnValue> {
  const { executor } = this;
  executor.renum();
  return null;
}
