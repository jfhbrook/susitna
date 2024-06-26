import { Expression } from '../ast/cmd';
import { CommandRunner, ReturnValue } from './base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Commander so that it can inspect and print it.
 */
export default function expression(
  this: CommandRunner,
  _expr: Expression,
): ReturnValue {
  return this.args[0];
}
