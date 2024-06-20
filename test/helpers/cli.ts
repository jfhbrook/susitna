import { Argv, cli, Env, Run, ConfigOptions } from '../../cli';
import { Level } from '../../host';

import { MockConsoleHost, MockExit } from './host';

export interface TestConfig extends ConfigOptions {
  level: Level;
}

function parseArgs(_argv: Argv, _env: Env): TestConfig {
  return { level: Level.Info };
}

export type TestCommand = () => Promise<void>;

export type CliTest = (command: TestCommand) => Promise<void>;

export async function cliTest(
  run: Run<TestConfig>,
  test: CliTest,
): Promise<void> {
  const main = cli({
    parseArgs,
    run,
  });

  function command(): Promise<void> {
    return main({
      host: new MockConsoleHost(),
      exit(code: number) {
        throw new MockExit(code || 0);
      },
      argv: [],
      env: {},
    });
  }

  await test(command);
}
