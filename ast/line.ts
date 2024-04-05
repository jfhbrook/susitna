import { Cmd } from './cmd';
import { Formatter, Formattable } from '../format';

export class Line implements Formattable {
  constructor(
    public lineNo: number,
    public commands: Cmd[],
  ) {}

  format(formatter: Formatter): string {
    return formatter.formatLine(this);
  }
}
