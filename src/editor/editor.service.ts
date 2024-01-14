import { Injectable } from '@nestjs/common';
import { Line, LineNo, Program } from '../internal';

@Injectable()
export class Editor {
  public program: Program;

  constructor() {
    this.program = new Program();
  }

  // dictionary operations on a program will either require lots of
  // indexing or lots of linear scans - probably both.
  getLine(lineNo: LineNo): Line {
    return [1];
  }

  setLine(line: Line): void {
    const lineNo = line[0] as LineNo;
  }

  deleteLine(lineNo: LineNo): void {}

  // a program may be loaded entirely from scratch. this would involve
  // completely replacing lines within the program, as well as re-initializing
  // the environment and other lookups.
  load(lines: Line[]): void {}
}
