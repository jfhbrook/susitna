import { Inject, Injectable } from '@nestjs/common';
import { ErrorService } from '../error/error.service';
import { Interrupt } from '../interrupt/interrupt.service';
import { Program } from '../internal';

@Injectable()
export class Runtime {
  constructor(
    private readonly interrupt: Interrupt,
    private readonly errorService: ErrorService,
  ) {}
}
