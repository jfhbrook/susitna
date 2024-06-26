import t from 'tap';
import { Test } from 'tap';

import { commandRunner } from '../commands';
import { RuntimeFault } from '../faults';
import { IntLiteral, StringLiteral } from '../ast/expr';
import { Cmd, Expression, Print, Exit, Rem } from '../ast/cmd';

const INVALID_CMDS: Array<[string, Cmd]> = [
  ['print', new Print(new IntLiteral(1))],
  ['exit', new Exit(null)],
];

const NOOP_CMDS: Array<[string, Cmd]> = [['rem', new Rem('A witty remark.')]];

t.test('invalid commands', async (t: Test) => {
  for (const [name, cmd] of INVALID_CMDS) {
    t.throws(
      () => cmd.accept(commandRunner([])),
      RuntimeFault,
      `${name} is an invalid command`,
    );
  }
});

t.test('noop commands', async (t: Test) => {
  for (const [name, cmd] of NOOP_CMDS) {
    t.equal(cmd.accept(commandRunner([])), null, `${name} returns null`);
  }
});

t.test('expression', async (t: Test) => {
  const expr = new Expression(new StringLiteral('hello'));
  const rv = expr.accept(commandRunner(['hello']));
  t.equal(rv, 'hello');
});
