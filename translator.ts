import { AssertionError } from 'assert';
import { readFile } from 'fs/promises';

import { trace, span } from './trace';
import { Config } from './config';
import { Commander } from './commander';
import { Host } from './host';
import { BaseException } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';
import { parseInput, parseProgram } from './parser';
import { Ok, Err, Warn } from './result';

export class Translator {
  constructor(
    private config: Config,
    private commander: Commander,
    private host: Host,
  ) {}

  async script(filename: string) {
    const source: string = await readFile(filename, 'utf8');
    const result = parseProgram(source, filename);
    for (const line of result.result.lines) {
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
      const parseResult = parseInput(input);

      if (parseResult instanceof Err) {
        this.host.writeException(parseResult.error);
        return;
      }

      if (parseResult instanceof Warn) {
        this.host.writeWarn(parseResult.warning);
      }

      if (!(parseResult instanceof Ok)) {
        throw RuntimeFault.fromError(
          new AssertionError({
            message: 'Result is not Ok',
            actual: typeof parseResult,
            expected: 'Ok',
            operator: 'instanceof',
          }),
          null,
        );
      }

      trace('parse result', parseResult.result);

      await this.commander.eval(parseResult.result);
    });
  }
}
