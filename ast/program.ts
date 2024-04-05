import { Line } from './line';
import { Formatter, Formattable } from '../format';

export class Program implements Formattable {
  constructor(public lines: Line[]) {}

  format(formatter: Formatter): string {
    return formatter.formatProgram(this);
  }
}
