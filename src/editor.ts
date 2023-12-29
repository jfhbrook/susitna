import { Line, LineNo, Program } from './internal';

export class Editor {
  public program: Program;

  constructor() {
    this.program = new Program();
  }

  // dictionary operations on a program will either require lots of
  // indexing or lots of linear scans - probably both.
  getLine(key: LineNo): Line {
    return { lineNo: 1, commands: []};
  }

  setLine(key: LineNo, value: Line): void {
  }

  deleteLine(key: LineNo): void {
  }

  // a program may be loaded entirely from scratch. this would involve
  // completely replacing lines within the program, as well as re-initializing
  // the environment and other lookups.
  load(lines: Line[]): void {
  }
}
