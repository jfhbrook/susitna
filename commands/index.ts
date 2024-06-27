import { Executor } from '../executor';
import { Value } from '../value';
import { CommandRunner, ReturnValue, invalid, noop } from './base';
import visitExpressionCmd from './expression';

export function commandRunner(
  executor: Executor,
  args: Value[],
): CommandRunner {
  return {
    executor,
    args,
    visitExpressionCmd,
    visitPrintCmd: invalid('print'),
    visitExitCmd: invalid('exit'),
    visitRemCmd: noop,
  };
}

export { CommandRunner, ReturnValue };
