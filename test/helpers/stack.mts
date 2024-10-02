import process from 'node:process';

import { expect } from 'vitest';

const CWD = process.cwd();
const CWD_RE = new RegExp(CWD, 'g');

export function expectSnapshotWithStack(
  actual: string,
  message?: string,
): void {
  expect(actual.replace(CWD_RE, '{{CWD}}'), message).toMatchSnapshot();
}
