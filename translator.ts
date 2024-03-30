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

    // TODO: Read file
    // TODO: Scan the file into tokens
    // TODO: Parse the tokens into Line[]
    // TODO: Use the lines to populate the Editor
    // TODO: Call run on the Commander
  }

  async repl() {
    await this.commander.using(async () => {
      while (true) {
        try {
          const input = await this.commander.prompt();
          await this.translate(input);
        } catch (err) {
          if (err instanceof BaseFault) {
            throw err;
          }

          if (err instanceof BaseException) {
            this.host.writeException(err);
          }

          throw RuntimeFault.fromError(err, null);
        }
      }
    });
  }

  async translate(input: string): Promise<void> {
    this.host.writeOut(input + '\n');
    // TODO: Scan the line into tokens
    // TODO: Parse the tokens into a Line | Command
    // TODO: If it's a Line, pass it to the Editor
    // TODO: If it's a Command, pass it to the Commander
  }
}
