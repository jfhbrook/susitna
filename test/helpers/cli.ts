import { join, resolve } from 'path';
import { readdirSync } from 'fs';

import { main } from '../../';
import { ExitCode } from '../../exit';
import { MockConsoleHost } from './host';

export const EXAMPLES = readdirSync(join(__dirname, '../../examples'))
  .filter((entry) => entry.endsWith('.bas'))
  .map((entry) => [entry, resolve(join(__dirname, '../../examples', entry))]);

export interface RunResult {
  exitCode: ExitCode;
  host: MockConsoleHost;
}

export function run(
  argv: typeof process.argv,
  env: typeof process.env,
): Promise<RunResult> {
  const host = new MockConsoleHost();
  return new Promise((resolve, reject) => {
    try {
      main({
        host,
        exit: (exitCode: number): void => {
          resolve({
            exitCode,
            host,
          });
        },
        argv,
        env,
      });
    } catch (err) {
      reject(err);
    }
  });
}
