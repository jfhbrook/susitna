import { Config } from './config';
import { Commander } from './commander';
import { Host } from './host';
import { BaseException } from './exceptions';
import { BaseFault, NotImplementedFault, RuntimeFault } from './faults';
import { parseInput } from './parser';
import { Result, Ok, Err, Warn } from './result';

export class Translator {
  constructor(
    private config: Config,
    private commander: Commander,
    private host: Host,
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
    try {
      const result = parseInput(input);

      if (result instanceof Err) {
        this.host.writeException(result.error);
      } else if (result instanceof Warn) {
        this.host.writeWarn(result.warning);
      } else if (result instanceof Ok) {
        console.log(result.result);
        // this.host.writeInfo(result.result);
      }
    } catch (err) {
      // TODO: Temporary for debugging
      if (err instanceof RuntimeFault) {
        this.host.writeException(err);
        return;
      }

      if (err instanceof BaseFault) {
        this.host.writeException(err);
        return;
      }

      throw err;
    }

    // TODO: If it's a Line, pass it to the Editor
    // TODO: If it's a Command, pass it to the Commander
  }
}
