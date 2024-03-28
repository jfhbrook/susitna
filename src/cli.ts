import { Config } from './config';
import { Exit } from './exit';
import { UsageFault } from './faults';
import { ConsoleHost, Host, LoggingOptions } from './host';

/**
 * Command line arguments.
 */
export type Argv = typeof process.argv;

/**
 * Command line environment.
 */
export type Env = typeof process.env;

/**
 * Options for running a CLI.
 */
export interface CliOptions {
  /**
   * A Host instance. Defaults to ConsoleHost.
   */
  host?: Host;

  /**
   * Command line arguments.
   */
  argv: Argv;

  /**
   * Command line environment.
   */
  env: Env;
}

/**
 * A CLI command.
 */
export interface Cli<C extends LoggingOptions> {
  /**
   * Parse command line arguments and environment into a config.
   *
   * @param argv Command line arguments.
   * @param env Command line environment.
   * @returns A config.
   */
  parseArgs(argv: typeof process.argv, env: typeof process.env): C;

  /**
   * Run the CLI command.
   *
   * @param config A config.
   * @param host A Host.
   * @returns A promise that resolves on completion.
   */
  run(config: C, host: Host): Promise<void>;
}

/**
 * A main function.
 *
 * @param options CLI options.
 * @returns A promise that resolves on completion.
 */
export type Main = (options: CliOptions) => Promise<void>;

/**
 * Create a main function from a CLI command.
 *
 * @param cli A CLI command.
 * @returns A main function.
 */
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
