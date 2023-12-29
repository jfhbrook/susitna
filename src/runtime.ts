import { Host } from './host';
import { Errors } from './errors';
import { Interrupts } from './interrupts';
import { Line } from './internal';

// Validates the program prior to running. The editor can do a lot syntax
// error checking during edit time, but anything involving context - for
// example, for loops being closed - happens here.
export function preRun(program: Line[]): void {
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
