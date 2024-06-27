import { getTracer } from './debug';
import { Config } from './config';
import { Executor } from './executor';
import { Exit } from './exit';
import { Host } from './host';
import { BaseException } from './exceptions';
import { BaseFault, RuntimeFault } from './faults';

const tracer = getTracer('main');

export class Translator {
  constructor(
    private _config: Config,
    private executor: Executor,
    private host: Host,
  ) {}

  async script(filename: string) {
    await this.executor.using(async () => {
      await tracer.span('script', async () => {
        await this.executor.load(filename);
        await this.executor.run();
      });
    });
  }

  async repl() {
    await this.executor.using(async () => {
      await tracer.span('repl', async () => {
        while (true) {
          try {
            const input = await this.executor.prompt();
            await this.executor.eval(input);
          } catch (err) {
            // TODO: This sort of logic is duplicated in the executor.
            // On that note, the logic in the executor is probably buggy.
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
