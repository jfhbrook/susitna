import { Config } from './config';
import { Host } from './host';
import { NotImplementedFault } from './faults';

export class Translator<H extends Host> {
  constructor(
    private config: Config,
    private host: H,
  ) {}

  async script(filename: string) {
    throw new NotImplementedFault('Translator#script', null);
  }

  async repl() {
    throw new NotImplementedFault('Translator#repl', null);
  }
}
