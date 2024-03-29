import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';

import { Exception } from './exceptions';

function parseArgs(argv: Argv, env: Env): Config {
  return Config.load(argv, env);
}

async function run(config: Config, host: Host): Promise<void> {
  const exc = new Exception('test exception', null);
  host.writeException(exc);

  /*
  const translator = app.get(Translator);

  await translator.run();
  */
}

export const main = cli({ parseArgs, run });
