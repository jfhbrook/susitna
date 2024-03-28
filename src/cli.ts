import { Config } from './config';
import { Exit } from './exit';
import { UsageFault } from './faults';
import { ConsoleHost, Host, LoggingOptions } from './host';

export type Argv = typeof process.argv;
export type Env = typeof process.env;

export interface CliOptions {
  host?: Host;
  argv: Argv;
  env: Env;
}

export interface Cli<C extends LoggingOptions> {
  parseArgs(argv: typeof process.argv, env: typeof process.env): C;
  run(config: C, host: Host): Promise<void>;
}
export type Main = (options: CliOptions) => Promise<void>;

export function cli<C extends LoggingOptions>(cli: Cli<C>): Main {
  return async function main({
    host: defaultHost,
    argv,
    env,
  }: CliOptions): Promise<void> {
    const host: Host = defaultHost || new ConsoleHost();

    try {
      const config = cli.parseArgs(argv, env);
      host.setLevel(config.level);
      // NOTE: It is up to the main function to initialize and close the
      // host.
      await cli.run(config, host);
    } catch (err) {
      // CLI usage faults are appropriate to log onto the console.
      if (err instanceof UsageFault) {
        console.log(err.message);
        process.exit(err.exitCode);
      }

      // Handle successful exits.
      if (err instanceof Exit) {
        if (err.message) {
          host.writeInfo(err.message);
        }
        process.exit(err.exitCode);
      }

      if (typeof err.exitCode === 'number') {
        host.writeError(err);
        process.exit(err.exitCode);
      }

      // TODO: Handle other Faults and Errors
      throw err;
    }
  };
}
