import t from 'tap';
import { Test } from 'tap';

import { scanner, TokenKind, KEYWORDS } from '../scanner';

import { scanTokens } from './helpers/scanner';

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
      const tokens = scanTokens(scanner, text);
      t.equal(tokens.length, 1);

      t.has(tokens[0], {
        kind,
        text,
      });
    });
  }
});

t.test('keywords', async (t: Test) => {
  for (let [text, kind] of Object.entries(KEYWORDS)) {
    t.test(`keyword ${text}`, async (t: Test) => {
      const tokens = scanTokens(scanner, text);
      t.equal(tokens.length, 1);

      t.has(tokens[0], {
        kind,
        text,
      });
    });
  }
});

const STRINGS = [
  '"hello world"',
  "'hello world'",
  '"\\"time machine\\""',
  "'don\\'t'",
];

t.test('strings', async (t: Test) => {
  for (let str of STRINGS) {
    t.test(`it tokenizes ${str}`, async (t: Test) => {
      const tokens = scanTokens(scanner, str);
      t.equal(tokens.length, 1);

      t.has(tokens[0], {
        kind: TokenKind.StringLiteral,
        text: str,
      });
    });
  }

  t.test('unterminated string', async (t: Test) => {
    t.throws(() => scanTokens(scanner, '"hello'));
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
      const tokens = scanTokens(scanner, text);
      t.equal(tokens.length, 1);

      t.has(tokens[0], {
        kind,
        text,
      });
    });
  }
});

const BOOL = [
  ['true', TokenKind.True],
  ['false', TokenKind.False],
];

t.test('booleans', async (t: Test) => {
  for (let [text, kind] of BOOL) {
    t.test(`it tokenizes ${text}`, async (t: Test) => {
      const tokens = scanTokens(scanner, text);
      t.equal(tokens.length, 1);

      t.has(tokens[0], {
        kind,
        text,
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
      const tokens = scanTokens(scanner, text);
      t.equal(tokens.length, 1);

      t.has(tokens[0], {
        kind,
        text,
      });
    });
  }
});

//
// Multi-token tests. These are to show that more interesting scenarios are
// tokenized *as expected* (the prior tests should show they tokenize at all).
//

t.test('hello world', async (t: Test) => {
  const tokens = scanTokens(scanner, 'print "hello world"');
  t.equal(tokens.length, 2);

  t.has(tokens[0], {
    kind: TokenKind.Print,
    text: 'print',
  });

  t.has(tokens[1], {
    kind: TokenKind.StringLiteral,
    text: '"hello world"',
  });
});

t.skip('function call', async (t: Test) => {
  const tokens = scanTokens(scanner, 'pony($u, $v)');
  t.equal(tokens.length, 6);

  t.has(tokens[0], {
    kind: TokenKind.Ident,
    text: 'pony',
  });

  t.has(tokens[1], {
    kind: TokenKind.LParen,
    text: '(',
  });

  t.has(tokens[2], {
    kind: TokenKind.Ident,
    text: '$u',
  });

  t.has(tokens[3], {
    kind: TokenKind.Comma,
    text: ',',
  });

  t.has(tokens[4], {
    kind: TokenKind.Ident,
    text: '$v',
  });

  t.has(tokens[5], {
    kind: TokenKind.RParen,
    text: ')',
  });
});
