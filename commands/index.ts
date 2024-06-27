import { CommandRunner, ReturnValue, invalid, noop } from './base';
import { Editor } from '../editor';
import { Executor } from '../executor';
import { Host } from '../host';
import { Value } from '../value';

import visitExpressionCmd from './expression';
import visitNewCmd from './new';
import visitLoadCmd from './load';
import visitSaveCmd from './save';
import visitRunCmd from './run';

export function commandRunner(
  executor: Executor,
  editor: Editor,
  host: Host,
  args: Array<Value>,
): CommandRunner {
  return {
    executor,
    editor,
    program: editor.program,
    host,
    args,
    visitExpressionCmd,
    visitPrintCmd: invalid('print'),
    visitExitCmd: invalid('exit'),
    visitRemCmd: noop,
    visitNewCmd,
    visitLoadCmd,
    visitSaveCmd,
    visitRunCmd,
  };
}

export { CommandRunner, ReturnValue };
