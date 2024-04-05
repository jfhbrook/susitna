import { Line, Program } from './ast';

//
//
export class Editor {
  public program: Program;

  constructor() {
    this.program = new Program([]);
  }

  // dictionary operations on a program will either require lots of
  // indexing or lots of linear scans - probably both.
  getLine(lineNo: number): Line {
    return new Line(lineNo, []);
  }

  setLine(_line: Line): void {}

  deleteLine(_lineNo: number): void {}

  // a program may be loaded entirely from scratch. this would involve
  // completely replacing lines within the program, as well as re-initializing
  // the environment and other lookups.
  load(_program: Program): void {}
}
