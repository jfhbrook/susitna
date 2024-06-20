import { Test } from 'tap';

import { Argv, cli, Env, Run, ConfigOptions } from '../../cli';
import { ExitCode } from '../../exit';
import { Level } from '../../host';

import { MockConsoleHost, MockExit } from './host';

export interface TestConfig extends ConfigOptions {
  level: Level;
}

function parseArgs(_argv: Argv, _env: Env): TestConfig {
  return { level: Level.Info };
}

export async function cliTest(
  t: Test,
  run: Run<TestConfig>,
  exitCode: ExitCode = ExitCode.Success,
): Promise<void> {
  const main = cli({
    parseArgs,
    run,
  });

  t.plan(2);

  try {
    await main({
      host: new MockConsoleHost(),
      exit(code: number) {
        throw new MockExit(code || 0);
      },
      argv: [],
      env: {},
    });
  } catch (err) {
    t.equal(err.exitCode, exitCode);
    t.type(err, MockExit);
  }
}
