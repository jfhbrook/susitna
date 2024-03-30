import { Config } from './config';
import { Host } from './host';

export class Commander<H extends Host> {
  constructor(
    private config: Config,
    private host: H,
  ) {}

  async init(): Promise<void> {
    await this.host.init({ level: this.config.level });
  }

  async close(): Promise<void> {
    await this.host.close();
  }
}
