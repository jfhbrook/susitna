import t from 'tap';
import { Test } from 'tap';
import { discuss } from '@jfhbrook/swears';

import { Editor, Justify } from '../editor.mjs';

import { Line } from '../ast/index.mjs';

import { parseInput } from './helpers/parser.mjs';
import { MockConsoleHost } from './helpers/host.mjs';

type InsertFn = (source: string) => void;

const topic = discuss(async (): Promise<[Editor, InsertFn]> => {
  const editor = new Editor(new MockConsoleHost());
  function insert(source: string) {
    const [result] = parseInput(source);
    t.equal(result.input.length, 1);
    const line = result.input[0];
    t.type(line, Line);
    editor.setLine(line as Line, null);
  }

  return [editor, insert];
});

t.test('editor inserts', async (t: Test) => {
  await topic.swear(async ([editor, insert]) => {
    insert('10 print "hello"');
    insert('30 print "world"');
    insert('20 print "hey"');
    insert('15 rem');
    insert('20');

    t.matchSnapshot(editor.list());
  });
});

// TODO: Test that editor.program has been shifted as expected. This will
// involve a full traversal of editor.program, twice, in order to calculate
// how each element shifted. Remember, expressions and tokens inside the
// program are also shifted!
//
// TODO: Test that editor.warnings has been shifted as expected. This will
// involve scanning editor.warnings, twice, in order to calcualte how each
// element shifted. It will also involve constructing lines which create
// warnings!
t.test('editor renum', async (t: Test) => {
  await t.test('mixed double/triple to all double', async (t: Test) => {
    await topic.swear(async ([editor, insert]) => {
      insert('10 print "foo"');
      insert('50 print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');

      editor.renum();

      t.matchSnapshot(editor.list());
    });
  });

  await t.test('left justified to left justified', async (t: Test) => {
    await topic.swear(async ([editor, insert]) => {
      insert('10  print "foo"');
      insert('50  print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');
      insert('450 print "foo"');

      editor.renum();

      t.matchSnapshot(editor.list());
    });
  });

  await t.test('left justified to right justified', async (t: Test) => {
    await topic.swear(async ([editor, insert]) => {
      editor.justify = Justify.Right;

      insert('10  print "foo"');
      insert('50  print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');
      insert('450 print "foo"');

      editor.renum();

      t.matchSnapshot(editor.list());
    });
  });

  await t.test('right justified to left justified', async (t: Test) => {
    await topic.swear(async ([editor, insert]) => {
      insert(' 10 print "foo"');
      insert(' 50 print "foo"');
      insert('100 print "foo"');
      insert('150 print "foo"');
      insert('200 print "foo"');
      insert('250 print "foo"');
      insert('300 print "foo"');
      insert('350 print "foo"');
      insert('400 print "foo"');
      insert('450 print "foo"');

      editor.renum();

      t.matchSnapshot(editor.list());
    });
  });
});
