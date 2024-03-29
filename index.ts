import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';

import * as assert from 'assert';
import { RuntimeFault } from './faults';
import { TRACEBACK } from './test/helpers/traceback';

function parseArgs(argv: Argv, env: Env): Config {
  return Config.load(argv, env);
}

async function run(config: Config, host: Host): Promise<void> {
  const underlying = new assert.AssertionError({
    message: 'underlying assertion',
    actual: false,
    expected: true,
    operator: '===',
  });

  throw new RuntimeFault(
    'Something went terribly wrong...',
    underlying,
    TRACEBACK,
  );
}

export const main = cli({ parseArgs, run });
