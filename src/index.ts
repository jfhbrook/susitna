import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';

export const main = cli({
  parseArgs(argv: Argv, env: Env): Config {
    return Config.load(argv, env);
  },
  async run(config: Config, host: Host): Promise<void> {
    host.writeInfo(config.toString());
  },
});
