import { readFile } from 'fs/promises';

import { getTracer } from './debug';
import { Config } from './config';
import { Commander } from './commander';
import { Exit } from './exit';
import { Host } from './host';
import { BaseException, Exception, Warning } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';
import { parseInput, parseProgram, ParseResult } from './parser';
import { Input, Line, Program } from './ast';

const tracer = getTracer('main');

export class Translator {
  constructor(
    private config: Config,
    private commander: Commander,
    private host: Host,
  ) {}

  async script(filename: string) {
    await this.commander.using(async () => {
      await tracer.span('script', async () => {
        const source: string = await readFile(filename, 'utf8');

        let result: ParseResult<Program>;

        try {
          result = parseProgram(source, filename);
        } catch (err) {
          if (err instanceof Exception) {
            throw err;
          }

          throw RuntimeFault.fromException(err);
        }

        await this.commander.evalProgram(result, filename);
      });
    });
  }

  async repl() {
    await this.commander.using(async () => {
      await tracer.span('repl', async () => {
        while (true) {
          try {
            const input = await this.commander.prompt();
            await this.translateInput(input);
          } catch (err) {
            if (err instanceof BaseFault || err instanceof Exit) {
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

  async translateInput(input: string): Promise<void> {
    await tracer.span('translateInput', async () => {
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

      // TODO: Ideally, we would pass this warning to the commander, so it
      // can merge them with warnings from the commands. But the warning
      // is for all input, not just an individual row.
      if (warning instanceof Warning) {
        this.host.writeWarn(warning);
      }

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
