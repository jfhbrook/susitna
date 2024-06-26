import t from 'tap';
import { Test } from 'tap';

import { commandRunner } from '../commands';
import { RuntimeFault } from '../faults';
import { IntLiteral, StringLiteral } from '../ast/expr';
import { Cmd, Expression, Print, Exit, Rem } from '../ast/cmd';

import { commanderTopic as topic } from './helpers/commander';

const INVALID_CMDS: Array<[string, Cmd]> = [
  ['print', new Print(new IntLiteral(1))],
  ['exit', new Exit(null)],
];

const NOOP_CMDS: Array<[string, Cmd]> = [['rem', new Rem('A witty remark.')]];

t.test('invalid commands', async (t: Test) => {
  await topic.swear(async ({ commander }) => {
    for (const [name, cmd] of INVALID_CMDS) {
      t.throws(
        () => cmd.accept(commandRunner(commander, [])),
        RuntimeFault,
        `${name} is an invalid command`,
      );
    }
  });
});

t.test('noop commands', async (t: Test) => {
  await topic.swear(async ({ commander }) => {
    for (const [name, cmd] of NOOP_CMDS) {
      t.equal(
        cmd.accept(commandRunner(commander, [])),
        null,
        `${name} returns null`,
      );
    }
  });
});

t.test('expression', async (t: Test) => {
  await topic.swear(async ({ commander }) => {
    const expr = new Expression(new StringLiteral('hello'));
    const rv = expr.accept(commandRunner(commander, ['hello']));
    t.equal(rv, 'hello');
  });
});
