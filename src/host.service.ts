// I/O stuff lives here.

export interface Host {
  prompt(): Promise<string>;
}

export class ConsoleHost implements Host {
  async prompt(): Promise<string> {
    return 'line';
  }
}
