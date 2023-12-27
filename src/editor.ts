import { Line, LineNo } from './internal';

export class Editor {
  public program: Line[];

  constructor() {
    this.program = [];
  }

  insertLine(line: Line): void {}
  deleteLine(lineNo: LineNo): void {}
  nextLine(lineNo: LineNo): LineNo { return 100; };
}
