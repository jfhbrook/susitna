import { Line } from './index.mjs';

function compareLines(a: Line, b: Line): number {
  return a.lineNo - b.lineNo;
}

export function sortLines(lines: Line[]): void {
  lines.sort(compareLines);
}
