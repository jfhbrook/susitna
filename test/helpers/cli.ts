import { Test as Testing } from '@nestjs/testing';
import { join, resolve } from 'path';
import { readdirSync } from 'fs';

import { Main } from '../../cli';
import { Config, Argv, Env } from '../../config';
import { Editor } from '../../editor';
import { Executor } from '../../executor';
import { ExitCode } from '../../exit';
import { MockConsoleHost } from './host';

export const EXAMPLES = readdirSync(join(__dirname, '../../examples'))
  .filter((entry) => entry.endsWith('.bas'))
  .map((entry) => [entry, resolve(join(__dirname, '../../examples', entry))]);

export interface RunResult {
  exitCode: ExitCode;
  host: MockConsoleHost;
}

export async function run(argv: Argv, env: Env): Promise<RunResult> {
  const host = new MockConsoleHost();

  return await new Promise((resolve, reject) => {
    try {
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
          Main,
        ],
      })
        .compile()
        .then(async (deps) => {
          try {
            const main = deps.get(Main);
            await main.start();
          } catch (err) {
            reject(err);
          }
        })
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
