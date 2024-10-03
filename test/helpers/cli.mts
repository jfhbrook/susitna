import { Test as Testing } from '@nestjs/testing';

import { Translator } from '../../translator.mjs';
import { Config, Argv, Env } from '../../config.mjs';
import { Editor } from '../../editor.mjs';
import { Executor } from '../../executor.mjs';
import { ExitCode } from '../../exit.mjs';

import { MockConsoleHost, MockConsoleHostOptions } from './host.mjs';

export interface RunResult {
  exitCode: ExitCode;
  host: MockConsoleHost;
}

export async function run(
  argv: Argv,
  env: Env,
  options?: MockConsoleHostOptions,
): Promise<RunResult> {
  const host = new MockConsoleHost(options);

  return await new Promise((resolve, reject) => {
    Testing.createTestingModule({
      providers: [
        {
          provide: 'Host',
          useValue: host,
        },
        {
          provide: 'argv',
          useValue: argv,
        },
        {
          provide: 'env',
          useValue: env,
        },
        {
          provide: Config,
          useValue: Config.load(argv, env),
        },
        {
          provide: 'exitFn',
          useValue: (exitCode: number): void => {
            resolve({
              exitCode,
              host,
            });
          },
        },
        Editor,
        Executor,
        Translator,
      ],
    })
      .compile()
      .then((deps) => {
        const main = deps.get(Translator);
        return main.start();
      })
      .catch(reject);
  });
}
