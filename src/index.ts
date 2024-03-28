import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';

function parseArgs(argv: Argv, env: Env): Config {
  return Config.load(argv, env);
}

async function run(config: Config, host: Host): Promise<void> {
  host.writeInfo(config.toString());
}

export const main = cli({ parseArgs, run });
