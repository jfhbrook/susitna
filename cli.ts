import { Exit, ExitCode } from './exit';
import { BaseFault, RuntimeFault, UsageFault } from './faults';
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
 * Exit the command.
 */
export type ExitFn = typeof process.exit;

/**
 * Options for running a CLI.
 */
export interface CliOptions {
  /**
   * A Host instance. Defaults to ConsoleHost.
   */
  host?: Host;

  /**
   * A command to exit the host. Defaults to process.exit.
   */
  exit?: ExitFn;

  /**
   * Command line arguments.
   */
  argv: Argv;

  /**
   * Command line environment.
   */
  env: Env;
}

export type Run<C> = (config: C, host: Host) => Promise<void>;

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
  parseArgs(argv: Argv, env: Env): C;

  /**
   * Run the CLI command.
   *
   * @param config A config.
   * @param host A Host.
   * @returns A promise that resolves on completion.
   */
  run: Run<C>;
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
    host: overriddenHost,
    exit: overriddenExit,
    argv,
    env,
  }: CliOptions): Promise<void> {
    const host: Host = overriddenHost || new ConsoleHost();
    const exit: ExitFn = overriddenExit || process.exit;

    try {
      const config = cli.parseArgs(argv, env);
      host.setLevel(config.level);
      // NOTE: It is up to the main function to initialize and close the
      // host.
      await cli.run(config, host);
    } catch (err) {
      reportError(err, host);
      exit(typeof err.exitCode === 'number' ? err.exitCode : ExitCode.Software);
    }

    // For consistency, explicitly exit instead of allowing Node to run the
    // command to completion.
    exit(0);
  };
}

/**
 * Report an error thrown by the CLI command.
 *
 * @param err The object thrown by the CLI command.
 * @param host A Host instance.
 */
export function reportError(err: any, host: Host): void {
  if (err instanceof UsageFault) {
    host.writeOut(err);
    host.writeOut('\n');
  }

  // Handle successful exits.
  if (err instanceof Exit) {
    host.writeInfo(err.message);
  }

  if (err.format) {
    try {
      host.writeException(err);
    } catch (_) {
      const fault = RuntimeFault.fromError(err, null);
      host.writeException(fault);
    }
  } else {
    const fault = RuntimeFault.fromError(err, null);
    host.writeException(fault);
  }
}
