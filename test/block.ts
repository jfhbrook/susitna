import t from 'tap';
import { Test } from 'tap';

import { StringLiteral } from '../ast/expr';
import { Print } from '../ast/instr';
import { Block } from '../compiler/block';
import { LineCompiler, RoutineType } from '../compiler/base';

import { FILENAME } from './helpers/files';

class TestBlock extends Block {
  constructor(public name: string) {
    super();
  }
}

const INSTR = new Print(new StringLiteral('hello world'));

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

t.test('Block', async (t: Test) => {
  await t.test('begin/end', async (t: Test) => {
    const compiler = createCompiler();
    const root = compiler.block;
    const block = createBlock(compiler, 'b');

    t.equal(compiler.block, root, 'Current block is root');

    compiler.block.begin(INSTR, block);

    t.equal(compiler.block, block, 'Current block is block');
    t.equal(block.instr, INSTR, 'instr is set by begin');
    t.equal(block.previous, null, 'b has no previous block');
    t.equal(block.parent, root, "b's parent block is root");

    block.end();

    t.equal(compiler.block, root, 'Current block is root');
  });

  await t.test('next', async (t: Test) => {
    const compiler = createCompiler();
    const root = compiler.block;
    const a = createBlock(compiler, 'a');
    compiler.block.begin(INSTR, a);
    const b = createBlock(compiler, 'b');

    t.equal(compiler.block, a, 'Current block is a');

    a.next(INSTR, b);

    t.equal(compiler.block, b, 'Current block is b');
    t.equal(b.instr, INSTR, 'instr is set by begin');
    t.equal(b.previous, a, 'a is the previous block');
    t.equal(b.parent, root, "b's parent block is root");
  });
});
