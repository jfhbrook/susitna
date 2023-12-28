import { Host } from './host';
import { Errors } from './errors';
import { Debugger } from './debug';
import { Line } from './internal';

// Validates the program prior to running. The editor can do a lot syntax
// error checking during edit time, but anything involving context - for
// example, for loops being closed - happens here.
export function preRun(program: Line[]): void {
}

export interface RuntimeOptions {
  host: Host;
  debug: Debugger;
  errors: Errors;
}

export class Runtime {
  private readonly host: Host;
  private readonly debugger: Debugger;
  private readonly errors: Errors;

  constructor({ host, debug, errors }: RuntimeOptions) {
    this.host = host;
    this.debug = debug;
    this.errors = errors;
  }
}
