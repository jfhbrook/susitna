import { Expression } from '../ast/instr';
import { CommandRunner, ReturnValue } from './base';

/**
 * An interactive expression.
 *
 * Interactive expressions are evaluated in the runtime, but their value
 * is returned to the Executor so that it can inspect and print it.
 */
export default async function expression(
  this: CommandRunner,
  _expr: Expression,
): Promise<ReturnValue> {
  return this.args[0];
}
