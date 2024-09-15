import { CommandRunner, ReturnValue, invalid, noop } from './base';
import { Editor } from '../editor';
import { Executor } from '../executor';
import { Host } from '../host';
import { Value } from '../value';

import visitExpressionInstr from './expression';
import visitNewInstr from './new';
import visitLoadInstr from './load';
import visitListInstr from './list';
import visitRenumInstr from './renum';
import visitSaveInstr from './save';
import visitRunInstr from './run';

export function commandRunner(
  executor: Executor,
  editor: Editor,
  host: Host,
  args: Array<Value | null>,
): CommandRunner {
  return {
    executor,
    editor,
    program: editor.program,
    host,
    args,
    visitExpressionInstr,
    visitPrintInstr: invalid('print'),
    visitRemInstr: noop,
    visitNewInstr,
    visitLoadInstr,
    visitListInstr,
    visitRenumInstr,
    visitSaveInstr,
    visitRunInstr,
    visitEndInstr: invalid('end'),
    visitExitInstr: invalid('exit'),
    visitLetInstr: invalid('let'),
    visitAssignInstr: invalid('assign'),
  };
}

export { CommandRunner, ReturnValue };
