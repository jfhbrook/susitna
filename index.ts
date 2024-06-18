import * as dotenv from 'dotenv';

import { MATBAS_BUILD } from './constants';

if (MATBAS_BUILD === 'debug') {
  dotenv.config();
}

import { getTracer } from './debug';

import { Argv, cli, Env } from './cli';
import { Config } from './config';
import { Host } from './host';
import { Commander } from './commander';
import { Translator } from './translator';

const tracer = getTracer('main');

function parseArgs(argv: Argv, env: Env): Config {
  return Config.load(argv, env);
}

async function run(config: Config, host: Host): Promise<void> {
  await tracer.span('main', async () => {
    const commander = new Commander(config, host);
    const translator = new Translator(config, commander, host);

    if (config.script) {
      await translator.script(config.script);
    } else {
      await translator.repl();
    }
  });
}

export const main = cli({ parseArgs, run });
