import { Injectable } from '@nestjs/common';

import { Line, Program } from '../internal';

@Injectable()
export class Recreator {
  line(line: Line): string {
    return 'some line';
  }

  program(program: Program): string {
    return 'some program';
  }
}
