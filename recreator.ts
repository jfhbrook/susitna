import { Line, Program } from './internal';

// Converts ASTs back into source code. Effectively a code formatter.
export class Recreator {
  line(line: Line): string {
    return 'some line';
  }

  program(program: Program): string {
    return 'some program';
  }
}
