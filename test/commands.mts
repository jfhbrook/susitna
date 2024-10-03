import t from 'tap';
import { Test } from 'tap';

import { commandRunner } from '../commands/index.mjs';
import { RuntimeFault } from '../faults.mjs';

import { IntLiteral, StringLiteral } from '../ast/expr.mjs';
import { Instr, Expression, Print, Exit, Rem } from '../ast/instr.mjs';

import { executorTopic as topic } from './helpers/executor.mjs';

const INVALID_CMDS: Array<[string, Instr]> = [
  ['print', new Print(new IntLiteral(1))],
  ['exit', new Exit(null)],
];

const NOOP_CMDS: Array<[string, Instr]> = [['rem', new Rem('A witty remark.')]];

t.test('invalid commands', async (t: Test) => {
  await topic.swear(async ({ executor, editor, host }) => {
    for (const [name, instr] of INVALID_CMDS) {
      t.rejects(
        () => instr.accept(commandRunner(executor, editor, host, [])),
        RuntimeFault,
        `${name} is an invalid command`,
      );
    }
  });
});

t.test('noop commands', async (t: Test) => {
  await topic.swear(async ({ executor, editor, host }) => {
    for (const [name, instr] of NOOP_CMDS) {
      t.equal(
        await instr.accept(commandRunner(executor, editor, host, [])),
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

    await executor.eval('25 print "how you doin\' world?"');
    await executor.eval('renum');

    await host.expect(
      t,
      executor.eval('list'),
      null,
      [
        '10 rem A simple hello world example',
        '20 print "hello world"',
        '30 print "how you doin\' world?"',
        '40 print "goodbye world"',
      ].join('\n'),
    );

    await executor.eval('save "hello-world.bas"');

    t.ok(host.files['/home/josh/matanuska/hello-world.bas']);

    await executor.eval('new "script.bas"');

    t.equal(editor.filename, 'script.bas');
    t.equal(editor.program.lines.length, 0);
  });
});
