import t from 'tap';
import { Test } from 'tap';

import { scanner, TokenKind, KEYWORDS } from '../scanner';

import { scanTokens } from './helpers/scanner';

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

t.test('keywords', async (t: Test) => {
  for (let [keyword, kind] of Object.entries(KEYWORDS)) {
    t.test(`keyword ${keyword}`, async (t: Test) => {
      const tokens = scanTokens(scanner, keyword);
      t.equal(tokens.length, 1);

      t.has(tokens[0], {
        kind: kind,
        text: keyword,
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
