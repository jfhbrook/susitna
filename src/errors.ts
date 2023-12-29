import { Host } from './host';

export interface ErrorHandlerOptions {
  host: Host;
}

export class ErrorHandler {
  private readonly host: Host;

  constructor({ host }: ErrorHandlerOptions) {
    this.host = host;
  }
}
