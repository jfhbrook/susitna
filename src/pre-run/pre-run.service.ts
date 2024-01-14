import { Injectable } from '@nestjs/common';

import { ErrorService } from '../error/error.service';
import { Program } from '../internal';

export function preRun(program: Program): void {}

@Injectable()
export class PreRun {
  constructor(private readonly errorService: ErrorService) {}

  process(program: Program): void {}
}
