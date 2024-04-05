import { AssertionError } from 'assert';
import { readFile } from 'fs/promises';

import { trace, span } from './trace';
import { Config } from './config';
import { Commander } from './commander';
import { formatter } from './format';
import { Host } from './host';
import { BaseException } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';
import { parseInput, parseProgram } from './parser';
import { Ok, Err, Warn } from './result';
import { Line } from './ast';

export class Translator {
  constructor(
    private config: Config,
    private commander: Commander,
    private host: Host,
  ) {}

  async script(filename: string) {
    const source: string = await readFile(filename, 'utf8');
    const result = parseProgram(source, filename);
    for (let line of result.result.lines) {
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
      const result = parseInput(input);

      if (result instanceof Err) {
        this.host.writeException(result.error);
        return;
      }

      if (result instanceof Warn) {
        this.host.writeWarn(result.warning);
      }

      if (!(result instanceof Ok)) {
        throw RuntimeFault.fromError(
          new AssertionError({
            message: 'Result is not Ok',
            actual: typeof result,
            expected: 'Ok',
            operator: 'instanceof',
          }),
          null,
        );
      }

      trace('parse result', result.result);

      for (let row of result.result) {
        if (row instanceof Line) {
          console.log('TODO: write line to Editor');
        } else {
          for (let cmd of row) {
            let value = await this.commander.evalCommand(cmd);
            if (value) {
              this.host.writeOut(formatter.format(value) + '\n');
            }
          }
        }
      }
    });
  }
}
