import { Commander } from '../commander';
import { Value } from '../value';
import { CommandRunner, ReturnValue, invalid, noop } from './base';
import visitExpressionCmd from './expression';

export function commandRunner(
  commander: Commander,
  args: Value[],
): CommandRunner {
  return {
    commander,
    args,
    visitExpressionCmd,
    visitPrintCmd: invalid('print'),
    visitExitCmd: invalid('exit'),
    visitRemCmd: noop,
    visitDeleteLineCmd: noop,
  };
}

export { CommandRunner, ReturnValue };
