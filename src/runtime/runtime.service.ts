import { Inject, Injectable } from '@nestjs/common';
import { Host } from '../host/host.service';
import { ErrorService } from '../error/error.service';
import { Interrupts } from '../interrupts/interrupts.service';
import { Program } from '../internal';

// Validates the program prior to running. The editor can do a lot of syntax
// error checking during edit time, but anything involving context happens
// here:
//
// - ensuring loops and conditionals are nested properly
// - resolving context-dependent fields, such as index locations for GOTOs
export function preRun(program: Program): void {}

@Injectable()
export class Runtime {
  constructor(
    @Inject('Host') private readonly host: Host,
    private readonly interrupts: Interrupts,
    private readonly errorService: ErrorService,
  ) {}
}
