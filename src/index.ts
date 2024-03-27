import { cli } from './cli';
import { Config } from './config';
import { Host } from './host';

export const main = cli({
  argv: process.argv.slice(2),
  env: process.env,
  async main(config: Config, host: Host) {
    host.writeInfo(config.toString());
  },
});
