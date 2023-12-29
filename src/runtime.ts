import { Host } from './host';
import { ErrorHandler } from './errors';
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
  errorHandler: ErrorHandler;
}

export class Runtime {
  private readonly host: Host;
  private readonly interrupts: Interrupts;
  private readonly errorHandler: ErrorHandler;

  constructor({ host, interrupts, errorHandler }: RuntimeOptions) {
    this.host = host;
    this.interrupts = interrupts;
    this.errorHandler = errorHandler;
  }
}
