import t from 'tap';
import { Test } from 'tap';

import { TokenKind, KEYWORDS } from '../scanner';

import { scanLine, scanTokens } from './helpers/scanner';

//
// Single-token tests. This should at least show that covered tokens can
// be scanned at all.
//

const PUNCTUATION = [
  ['(', TokenKind.LParen],
  [')', TokenKind.RParen],
  [',', TokenKind.Comma],
  [';', TokenKind.Semicolon],
  [':', TokenKind.Colon],
  ['=', TokenKind.Equals],
  ['#', TokenKind.Hash],
];

t.test('punctuation', async (t: Test) => {
  for (let [text, kind] of PUNCTUATION) {
    t.test(text, async (t: Test) => {
      const tokens = scanLine(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        text,
        line: text,
      });

      t.has(tokens[0].pos, {
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: 1,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        text: '',
        line: text,
      });
    });
  }
});

t.test('keywords', async (t: Test) => {
  for (let [text, kind] of Object.entries(KEYWORDS)) {
    t.test(`keyword ${text}`, async (t: Test) => {
      const tokens = scanLine(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        text,
        line: text,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        text: '',
        line: text,
      });
    });
  }
});

const STRINGS = [
  ['"hello world"', 'hello world'],
  ["'hello world'", 'hello world'],
  ['"\\"time machine\\""', '"time machine"'],
  ["'don\\'t'", "don't"],
];

t.test('strings', async (t: Test) => {
  for (let [text, value] of STRINGS) {
    t.test(`it tokenizes ${text}`, async (t: Test) => {
      const tokens = scanLine(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind: TokenKind.StringLiteral,
        text,
        value,
        line: text,
      });

      t.has(tokens[0].pos, {
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        text: '',
        line: text,
      });
    });
  }

  t.test('unterminated string', async (t: Test) => {
    const text = '"hello';
    const tokens = scanLine(text);
    t.equal(tokens.length, 2);

    t.has(tokens[0], {
      kind: TokenKind.UnterminatedStringLiteral,
      text,
      line: text,
    });

    t.has(tokens[0].pos, {
      index: 0,
      row: 1,
      offsetStart: 0,
      offsetEnd: text.length,
    });

    t.has(tokens[1], {
      kind: TokenKind.Eof,
      text: '',
      line: text,
    });
  });
});

const NUMBERS = [
  ['123', TokenKind.DecimalLiteral],
  ['123_000', TokenKind.DecimalLiteral],
  ['0xfF13', TokenKind.HexLiteral],
  ['0xfF_ab', TokenKind.HexLiteral],
  ['0o715', TokenKind.OctalLiteral],
  ['0o715_000', TokenKind.OctalLiteral],
  ['0b101', TokenKind.BinaryLiteral],
  ['123.456', TokenKind.RealLiteral],
  ['123_000.456', TokenKind.RealLiteral],
  ['123.456e10', TokenKind.RealLiteral],
];

t.test('numbers', async (t: Test) => {
  for (let [text, kind] of NUMBERS) {
    t.test(`it tokenizes ${text}`, async (t: Test) => {
      const tokens = scanLine(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        text,
        line: text,
      });

      t.has(tokens[0].pos, {
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        text: '',
        line: text,
      });
    });
  }
});

const IDENT = [
  ['pony', TokenKind.Ident],
  ['_abc123', TokenKind.Ident],
  ['$pony', TokenKind.StringIdent],
  ['$_abc123', TokenKind.StringIdent],
];

t.test('identifiers', async (t: Test) => {
  for (let [text, kind] of IDENT) {
    t.test(`it tokenizes ${text}`, async (t: Test) => {
      const tokens = scanLine(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind,
        text,
        line: text,
      });

      t.has(tokens[0].pos, {
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        text: '',
        line: text,
      });
    });
  }
});

const SHELL = [
  '/',
  './',
  '..',
  '../',
  './pony',
  '.\\pony',
  '-o',
  '--long-option',
];

t.test('shell tokens', async (t: Test) => {
  for (let text of SHELL) {
    t.test(`it tokenizes ${text}`, async (t: Test) => {
      const tokens = scanLine(text);
      t.equal(tokens.length, 2);

      t.has(tokens[0], {
        kind: TokenKind.ShellToken,
        text,
        line: text,
      });

      t.has(tokens[0].pos, {
        index: 0,
        row: 1,
        offsetStart: 0,
        offsetEnd: text.length,
      });

      t.has(tokens[1], {
        kind: TokenKind.Eof,
        text: '',
        line: text,
      });
    });
  }
});

//
// Multi-token tests. These are to show that more interesting scenarios are
// tokenized *as expected* (the prior tests should show they tokenize at all).
//

t.test('hello world', async (t: Test) => {
  const text = 'print "hello world"';
  const tokens = scanLine(text);
  t.equal(tokens.length, 3);

  t.has(tokens[0], {
    kind: TokenKind.Print,
    text: 'print',
    line: text,
  });

  t.has(tokens[0].pos, {
    index: 0,
    row: 1,
    offsetStart: 0,
    offsetEnd: 5,
  });

  t.has(tokens[1], {
    kind: TokenKind.StringLiteral,
    text: '"hello world"',
    value: 'hello world',
    line: text,
  });

  t.has(tokens[1].pos, {
    index: 6,
    row: 1,
    offsetStart: 6,
    offsetEnd: 19,
  });

  t.has(tokens[2], {
    kind: TokenKind.Eof,
    text: '',
    line: text,
  });
});

t.test('function call', async (t: Test) => {
  const text = 'pony($u, $v)';
  const tokens = scanLine(text);
  t.equal(tokens.length, 7);

  t.has(tokens[0], {
    kind: TokenKind.Ident,
    text: 'pony',
    line: text,
  });

  t.has(tokens[1], {
    kind: TokenKind.LParen,
    text: '(',
    line: text,
  });

  t.has(tokens[2], {
    kind: TokenKind.StringIdent,
    text: '$u',
    line: text,
  });

  t.has(tokens[3], {
    kind: TokenKind.Comma,
    text: ',',
    line: text,
  });

  t.has(tokens[4], {
    kind: TokenKind.StringIdent,
    text: '$v',
    line: text,
  });

  t.has(tokens[5], {
    kind: TokenKind.RParen,
    text: ')',
    line: text,
  });

  t.has(tokens[6], {
    kind: TokenKind.Eof,
    text: '',
    line: text,
  });
});

t.test('line endings', async (t: Test) => {
  const tokens = scanTokens('\n\n');
  t.equal(tokens.length, 3);

  t.has(tokens[0], {
    kind: TokenKind.LineEnding,
    text: '\n',
  });

  t.has(tokens[0].pos, {
    index: 0,
    row: 1,
    offsetStart: 0,
    offsetEnd: 1,
  });

  t.has(tokens[1], {
    kind: TokenKind.LineEnding,
    text: '\n',
  });

  t.has(tokens[1].pos, {
    index: 1,
    row: 2,
    offsetStart: 0,
    offsetEnd: 1,
  });

  t.has(tokens[2], {
    kind: TokenKind.Eof,
    text: '',
  });
});

t.test('line endings with whitespace', async (t: Test) => {
  const tokens = scanTokens('    \n\n    ');
  t.equal(tokens.length, 3);

  t.has(tokens[0], {
    kind: TokenKind.LineEnding,
    text: '\n',
  });

  t.has(tokens[0].pos, {
    index: 4,
    row: 1,
    offsetStart: 4,
    offsetEnd: 5,
  });

  t.has(tokens[1], {
    kind: TokenKind.LineEnding,
    text: '\n',
  });

  t.has(tokens[1].pos, {
    index: 5,
    row: 2,
    offsetStart: 0,
    offsetEnd: 1,
  });

  t.has(tokens[2], {
    kind: TokenKind.Eof,
    text: '',
  });

  t.has(tokens[2].pos, {
    index: 10,
    row: 3,
    offsetStart: 4,
    offsetEnd: 4,
  });
});
