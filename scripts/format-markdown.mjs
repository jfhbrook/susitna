#!/usr/bin/env node

/**
 * This script removes newlines from justified paragraphs. I'm in the habit
 * of keeping the text width of markdown at 80 characters, but many renderers
 * (for example, dev.to) assume any newlines in paragraphs are intentional.
 *
 * BUGS
 *
 * There are many bugs. This is because I'm not doing real parsing. Two that
 * I'm aware of:
 *
 * 1. Numbered lines do not retain their newlines
 * 2. Tables do not retain their newlines
 *
 * Check the output of any formatted file and do partial commits!
 */

import { readFileSync, writeFileSync } from 'node:fs';

import { globSync } from 'glob';
import * as prettier from 'prettier';

const SPACING = ['', ' ', '  ', '   ', '    ', '      '];
const BULLETS = ['-', '\\*'];

function escape(contents) {
  let escaped = contents.replace(/\n\n/g, 'NEWLINENEWLINE');

  for (const spacing of SPACING) {
    for (const bullet of BULLETS) {
      escaped = escaped.replace(
        new RegExp(`\\n${spacing}${bullet}`, 'g'),
        `NEWLINE${spacing}${bullet}`,
      );
    }
  }

  return escaped;
}

function unescape(contents) {
  return contents.replace(/NEWLINE/g, '\n');
}

function format(contents) {
  const escaped = escape(contents);
  let inCodeBlock = false;
  let formatted = '';

  for (const line of escaped.split('\n')) {
    if (line == '') {
      if (inCodeBlock) {
        formatted += unescape(line) + '\n';
      } else {
        formatted += unescape(line) + ' ';
      }
      continue;
    }

    const codeChunks = line.split('```');

    for (const chunk of codeChunks.slice(0, -1)) {
      formatted += unescape(chunk) + '```';
      if (inCodeBlock) {
        formatted += '\n';
      } else {
        formatted += ' ';
      }
      inCodeBlock = !inCodeBlock;
    }
    const lastCodeChunk = codeChunks[codeChunks.length - 1];
    if (inCodeBlock) {
      formatted += unescape(lastCodeChunk) + '\n';
    } else {
      formatted += unescape(lastCodeChunk) + ' ';
    }
  }
  return prettier.format(formatted, { parser: 'markdown' });
}

async function main() {
  const file = process.argv[2];
  const contents = readFileSync(file, 'utf8');
  const formatted = await format(contents);
  if (formatted.trim() !== contents.trim()) {
    console.log(file);
    writeFileSync(file, formatted, 'utf8');
  }
}

main();
