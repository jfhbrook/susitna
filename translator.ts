import { readFile } from 'fs/promises';

import { trace, span } from './trace';
import { Config } from './config';
import { Commander } from './commander';
import { Host } from './host';
import { BaseException, Exception, Warning } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';
import { parseInput, parseProgram, ParseResult } from './parser';
import { Input, Program } from './ast';

export class Translator {
  constructor(
    private config: Config,
    private commander: Commander,
    private host: Host,
  ) {}

  async script(filename: string) {
    const source: string = await readFile(filename, 'utf8');
    const result = parseProgram(source, filename);
    for (const line of result[0].lines) {
      console.log(line);
    }
  }

  async repl() {
    await this.commander.using(async () => {
      await span('repl', async () => {
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
    });
  }

  async translate(input: string): Promise<void> {
    await span('translate', async () => {
      let parseResult: ParseResult<Input | Program>;

      try {
        parseResult = parseInput(input);
      } catch (err) {
        if (err instanceof Exception) {
          this.host.writeException(err);
        }

        throw RuntimeFault.fromException(err);
      }

      if (parseResult[1] instanceof Warning) {
        this.host.writeWarn(parseResult[1]);
        return;
      }

      trace('parse result', parseResult[0]);

      await this.commander.eval(parseResult[0]);
    });
  }
}
