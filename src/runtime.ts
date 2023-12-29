import { Host } from './host';
import { Errors } from './errors';
import { Interrupts } from './interrupts';
import { Program } from './internal';

// Validates the program prior to running. The editor can do a lot of syntax
// error checking during edit time, but anything involving context happens
// here:
//
// - ensuring loops and conditionals are nested properly
// - resolving context-dependent fields, such as index locations for GOTOs
export function preRun(program: Program): void {
}

export interface RuntimeOptions {
  host: Host;
  interrupts: Interrupts;
  errors: Errors;
}

export class Runtime {
  private readonly host: Host;
  private readonly interrupts: Interrupts;
  private readonly errors: Errors;

  constructor({ host, interrupts, errors }: RuntimeOptions) {
    this.host = host;
    this.interrupts = interrupts;
    this.errors = errors;
  }
}
