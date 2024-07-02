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

t.test('editing', async (t: Test) => {
  await topic.swear(async ({ executor, editor, host }) => {
    await executor.eval('load "./examples/001-hello-world.bas"');

    t.equal(editor.filename, 'examples/001-hello-world.bas');
    t.equal(editor.program.lines.length, 3);

    await host.expect(
      t,
      executor.eval('run'),
      null,
      'hello world\ngoodbye world',
    );

    await host.expect(
      t,
      executor.eval('list'),
      null,
      [
        '10 rem A simple hello world example',
        '20 print "hello world"',
        '30 print "goodbye world"',
      ].join('\n'),
    );

    await executor.eval('save "hello-world.bas"');

    t.ok(host.files['/home/josh/matanuska/hello-world.bas']);

    await executor.eval('new "script.bas"');

    t.equal(editor.filename, 'script.bas');
    t.equal(editor.program.lines.length, 0);
  });
});
