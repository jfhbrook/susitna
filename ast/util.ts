import { Line } from './';

export function compareLines(a: Line, b: Line): number {
  return a.lineNo - b.lineNo;
}
