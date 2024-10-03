import t from 'tap';
import { Test } from 'tap';

import { formatter } from '../format';

import { StringLiteral } from '../ast/expr';
import {
  Print,
  Expression,
  Rem,
  New,
  Load,
  List,
  Renum,
  Save,
  Run,
  Exit,
  End,
  If,
  ShortIf,
  Else,
  ElseIf,
  EndIf,
} from '../ast/instr';
import { Block } from '../compiler/block';
import { LineCompiler, RoutineType } from '../compiler/base';

import { FILENAME } from './helpers/files';

class TestBlock extends Block {
  constructor(public name: string) {
    super();
  }
}

const PRINT = new Print(new StringLiteral('hello world'));

function createCompiler(): LineCompiler {
  const compiler = new LineCompiler([], RoutineType.Program, {
    filename: FILENAME,
  });
  return compiler;
}

function createBlock(compiler: LineCompiler, name: string): TestBlock {
  const block = new TestBlock(name);
  block.init(compiler, null, null, null);
  return block;
}

const INVALID_INSTRS = [
  PRINT,
  new Expression(new StringLiteral('a')),
  new Rem('remark'),
  new New(null),
  new Load(new StringLiteral('file'), false),
  new List(),
  new Renum(),
  new Save(new StringLiteral('file')),
  new Run(),
  new Exit(null),
  new End(),
  new If(new StringLiteral('foo')),
  new ShortIf(new StringLiteral('foo'), [], []),
];

const MISMATCHED_INSTRS = [
  new Else(),
  new ElseIf(new StringLiteral('bar')),
  new EndIf(),
];

t.test('Block', async (t: Test) => {
  await t.test('begin/end', async (t: Test) => {
    const compiler = createCompiler();
    const root = compiler.block;
    const block = createBlock(compiler, 'b');

    t.equal(compiler.block, root, 'Current block is root');

    compiler.block.begin(PRINT, block);

    t.equal(compiler.block, block, 'Current block is block');
    t.equal(block.instr, PRINT, 'instr is set by begin');
    t.equal(block.previous, null, 'b has no previous block');
    t.equal(block.parent, root, "b's parent block is root");

    block.end();

    t.equal(compiler.block, root, 'Current block is root');
  });

  await t.test('next', async (t: Test) => {
    const compiler = createCompiler();
    const root = compiler.block;
    const a = createBlock(compiler, 'a');
    compiler.block.begin(PRINT, a);
    const b = createBlock(compiler, 'b');

    t.equal(compiler.block, a, 'Current block is a');

    a.next(PRINT, b);

    t.equal(compiler.block, b, 'Current block is b');
    t.equal(b.instr, PRINT, 'instr is set by begin');
    t.equal(b.previous, a, 'a is the previous block');
    t.equal(b.parent, root, "b's parent block is root");
  });

  // TODO: Assert the error messages...
  await t.test('handle', async (t: Test) => {
    for (const instr of INVALID_INSTRS) {
      await t.test(
        `invalid instruction ${formatter.format(instr)}`,
        async (t: Test) => {
          const compiler = createCompiler();
          const block = createBlock(compiler, 'block');
          t.throws(() => {
            block.handle(instr);
          });
        },
      );
    }

    for (const instr of MISMATCHED_INSTRS) {
      await t.test(
        `mismatched instruction ${formatter.format(instr)}`,
        async (t: Test) => {
          const compiler = createCompiler();
          const block = createBlock(compiler, 'block');
          t.throws(() => {
            block.handle(instr);
          });
        },
      );
    }
  });
});
