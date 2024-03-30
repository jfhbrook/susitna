import { Config } from './config';
import { Host } from './host';

export class Commander<H extends Host> {
  constructor(
    private config: Config,
    private host: H,
  ) {}

  async using(fn: () => Promise<void>): Promise<void> {
    await this.init();
    try {
      await fn();
    } finally {
      await this.close();
    }
  }

  async init(): Promise<void> {
    await this.host.init({ level: this.config.level });
  }

  async close(): Promise<void> {
    await this.host.close();
  }
}
