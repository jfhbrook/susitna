import { Value } from '../value';
import { CommandRunner, ReturnValue, invalid, noop } from './base';
import visitExpressionCmd from './expression';

export function commandRunner(args: Value[]): CommandRunner {
  return {
    args,
    visitExpressionCmd,
    visitPrintCmd: invalid('print'),
    visitExitCmd: invalid('exit'),
    visitRemCmd: noop,
  };
}

export { CommandRunner, ReturnValue };
