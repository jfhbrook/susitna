import { Config } from './config';
import { Commander } from './commander';
import { Host } from './host';
import { BaseException } from './exceptions';
import { BaseFault, NotImplementedFault, RuntimeFault } from './faults';

export class Translator<H extends Host> {
  constructor(
    private config: Config,
    private commander: Commander<H>,
    private host: H,
  ) {}

  async script(filename: string) {
    throw new NotImplementedFault('Translator#script', null);
  }

  async repl() {
    await this.commander.using(async () => {
      while (true) {
        try {
          const input = await this.host.prompt('>');
          this.host.writeOut(input + '\n');
        } catch (err) {
          if (err instanceof BaseFault) {
            throw err;
          }

          if (err instanceof BaseException) {
            this.host.writeException(err);
          }

          throw new RuntimeFault(
            err.message || String(err),
            err instanceof Error ? err : new Error(String(err)),
            null,
          );
        }
      }
    });
  }
}
