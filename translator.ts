import { getTracer } from './debug';
import { Config } from './config';
import { Commander } from './commander';
import { Exit } from './exit';
import { Host } from './host';
import { BaseException } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';

const tracer = getTracer('main');

export class Translator {
  constructor(
    private _config: Config,
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
            await this.commander.eval(input);
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
}
