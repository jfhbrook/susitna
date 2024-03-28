import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';

import { RuntimeFault } from './faults';

function parseArgs(argv: Argv, env: Env): Config {
  return Config.load(argv, env);
}

async function run(config: Config, host: Host): Promise<void> {
  throw new RuntimeFault('runtime fault', new Error('underlying error'), null);
}

export const main = cli({ parseArgs, run });
