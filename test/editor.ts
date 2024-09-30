import t from 'tap';
import { Test } from 'tap';
import { discuss } from '@jfhbrook/swears';

import { Editor } from '../editor';
import { Line } from '../ast';

import { parseInput } from './helpers/parser';
import { MockConsoleHost } from './helpers/host';

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

  await t.test('left justified', async (t: Test) => {
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

  await t.test('right justified', async (t: Test) => {
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
