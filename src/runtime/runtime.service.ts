import { Inject, Injectable } from '@nestjs/common';
import { Host } from '../host/host.service';
import { ErrorService } from '../error/error.service';
import { Interrupt } from '../interrupt/interrupt.service';
import { Program } from '../internal';

@Injectable()
export class Runtime {
  constructor(
    @Inject('Host') private readonly host: Host,
    private readonly interrupt: Interrupt,
    private readonly errorService: ErrorService,
  ) {}
}
