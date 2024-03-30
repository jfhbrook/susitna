import { Config } from './config';
import { Commander } from './commander';
import { Host } from './host';
import { NotImplementedFault } from './faults';

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
    await this.commander.init();

    try {
      while (true) {
        const input = await this.host.prompt('>');
        this.host.writeOut(input + '\n');
      }
    } catch (err) {
      throw err;
    } finally {
      await this.commander.close();
    }
  }
}
