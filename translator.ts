import { readFile } from 'fs/promises';

import { trace, span } from './trace';
import { Config } from './config';
import { Commander } from './commander';
import { Host } from './host';
import { BaseException, Exception, Warning } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';
import { parseInput, parseProgram } from './parser';
import { Input, Line } from './ast';

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
      let result: Input;
      let warning: Warning | null;

      try {
        [result, warning] = parseInput(input);
      } catch (err) {
        if (err instanceof Exception) {
          this.host.writeException(err);
          return;
        }

        throw RuntimeFault.fromException(err);
      }

      if (warning instanceof Warning) {
        this.host.writeWarn(warning);
      }

      trace('parse result', result);

      for (const row of result.input) {
        if (row instanceof Line) {
          console.log('TODO: insert into editor', row);
        } else {
          await this.commander.evalCommands(row);
        }
      }
    });
  }
}
