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

Object.entries(KEYWORDS).forEach(([keyword, kind]) => {
  t.test(`keyword ${keyword}`, async (t: Test) => {
    const tokens = scanTokens(scanner, keyword);
    t.equal(tokens.length, 1);

    t.has(tokens[0], {
      kind: kind,
      text: keyword,
    });
  });
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
});
