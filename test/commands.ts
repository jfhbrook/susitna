import t from 'tap';
import { Test } from 'tap';

import { commandRunner } from '../commands';
import { RuntimeFault } from '../faults';
import { IntLiteral, StringLiteral } from '../ast/expr';
import { Cmd, Expression, Print, Exit, Rem } from '../ast/cmd';

import { executorTopic as topic } from './helpers/executor';

const INVALID_CMDS: Array<[string, Cmd]> = [
  ['print', new Print(new IntLiteral(1))],
  ['exit', new Exit(null)],
];

const NOOP_CMDS: Array<[string, Cmd]> = [['rem', new Rem('A witty remark.')]];

t.test('invalid commands', async (t: Test) => {
  await topic.swear(async ({ executor, editor, host }) => {
    for (const [name, cmd] of INVALID_CMDS) {
      t.rejects(
        () => cmd.accept(commandRunner(executor, editor, host, [])),
        RuntimeFault,
        `${name} is an invalid command`,
      );
    }
  });
});

t.test('noop commands', async (t: Test) => {
  await topic.swear(async ({ executor, editor, host }) => {
    for (const [name, cmd] of NOOP_CMDS) {
      t.equal(
        await cmd.accept(commandRunner(executor, editor, host, [])),
        null,
        `${name} returns null`,
      );
    }
  });
});

t.test('expression', async (t: Test) => {
  await topic.swear(async ({ executor, editor, host }) => {
    const expr = new Expression(new StringLiteral('hello'));
    const rv = await expr.accept(
      commandRunner(executor, editor, host, ['hello']),
    );
    t.equal(rv, 'hello');
  });
});

t.todo('editing', async (t: Test) => {
  await topic.swear(async ({ executor, editor, host }) => {
    t.ok(executor);
    t.ok(editor);
    t.ok(host);
    // TODO: load a test program into the editor
    // TODO: run the test program
    // TODO: edit the test program "manually"
    // TODO: save the test program
    // TODO: start a new program
  });
});
