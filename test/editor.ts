import t from 'tap';
import { Test } from 'tap';

import { Editor } from '../editor';
import { parseInput } from '../parser';
import { Line } from '../ast';

import { MockConsoleHost } from './helpers/host';

t.test('editor', async (t: Test) => {
  const editor = new Editor(new MockConsoleHost());
  function insert(source: string) {
    const [result] = parseInput(source);
    t.equal(result.input.length, 1);
    const line = result.input[0];
    t.type(line, Line);
    editor.setLine(line as Line, null);
  }

  insert('10 print "hello"');
  insert('30 print "world"');
  insert('20 print "hey"');
  insert('15 rem');
  insert('20');

  t.matchSnapshot(editor.list());
});
