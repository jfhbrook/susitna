import { getTracer } from './debug';
import { Config } from './config';
import { Commander } from './commander';
import { Editor } from './editor';
import { Exit } from './exit';
import { Host } from './host';
import { BaseException, Exception, Warning } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';
import { parseInput } from './parser';
import { Input, Line } from './ast';

const tracer = getTracer('main');

export class Translator {
  constructor(
    private _config: Config,
    private editor: Editor,
    private commander: Commander,
    private host: Host,
  ) {}

  async script(filename: string) {
    await this.commander.using(async () => {
      await tracer.span('script', async () => {
        await this.commander.load(filename);
        await this.commander.run();
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

  // TODO: Can some of this logic be pushed into the commander? Right now,
  // programs are parsed in the commander while input is parsed in the
  // translator. It feels awkward!
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

      // TODO: If we can split warnings up by the row they're from, then
      // we can push a subset of those warnings down to evalCommands. But
      // that's hard and annoying. We'll just log them here for now.
      if (warning instanceof Warning) {
        this.host.writeWarn(warning);
      }

      for (const row of result.input) {
        if (row instanceof Line) {
          this.editor.setLine(row);
          console.log(this.editor.program.lines);
        } else {
          // The API still supports it, though
          await this.commander.evalCommands([row, null]);
        }
      }
    });
  }
}
