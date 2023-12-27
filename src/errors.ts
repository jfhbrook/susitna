import { Host } from './host';

export interface ErrorOptions {
  host: Host;
}

export class Errors {
  private readonly host: Host;

  constructor({ host }: ErrorOptions) {
    this.host = host;
  }
}
