import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';
import { Translator } from './translator';

function parseArgs(argv: Argv, env: Env): Config {
  return Config.load(argv, env);
}

async function run(config: Config, host: Host): Promise<void> {
  const translator = new Translator(config, host);

  if (config.script) {
    await translator.script(config.script);
  } else {
    await translator.repl();
  }
}

export const main = cli({ parseArgs, run });
