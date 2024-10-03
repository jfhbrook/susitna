import { List } from '../ast/instr.js';

import { CommandRunner, ReturnValue } from './base.mjs';

/**
 * List the current program.
 */
export default async function list(
  this: CommandRunner,
  _list: List,
): Promise<ReturnValue> {
  const { executor } = this;
  executor.list();
  return null;
}
