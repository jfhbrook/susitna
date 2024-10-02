import { CommandRunner, ReturnValue, invalid, noop } from './base.mjs';
import { Editor } from '../editor.mjs';
import { Executor } from '../executor.mjs';
import { Host } from '../host.mjs';
import { Value } from '../value/index.mjs';

import visitExpressionInstr from './expression.mjs';
import visitNewInstr from './new.mjs';
import visitLoadInstr from './load.mjs';
import visitListInstr from './list.mjs';
import visitRenumInstr from './renum.mjs';
import visitSaveInstr from './save.mjs';
import visitRunInstr from './run.mjs';

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
    visitShortIfInstr: invalid('if'),
    visitIfInstr: invalid('if'),
    visitElseInstr: invalid('else'),
    visitElseIfInstr: invalid('else if'),
    visitEndIfInstr: invalid('endif'),
  };
}

export { CommandRunner, ReturnValue };
