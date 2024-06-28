import { List } from '../ast/cmd';
import { CommandRunner, ReturnValue } from './base';

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
