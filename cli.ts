import { getTracer } from './debug';
import { Exit, ExitCode } from './exit';
import { RuntimeFault, UsageFault } from './faults';
import { ConsoleHost, Host, Level } from './host';

const tracer = getTracer('main');

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
 * Options for configuring the CLI.
 */
export interface ConfigOptions {
  /**
   * An optional logging level. Defaults to Info.
   */
  level?: Level;
}

/**
 * Options for running a CLI.
 */
export interface RuntimeOptions {
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
export interface Cli<C extends ConfigOptions> {
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
export type Main = (options: RuntimeOptions) => Promise<void>;

/**
 * Create a main function from a CLI command.
 *
 * @param cli A CLI command.
 * @returns A main function.
 */
export function cli<C extends ConfigOptions>(cli: Cli<C>): Main {
  let error: any = null;
  return async function main({
    host: overriddenHost,
    exit: overriddenExit,
    argv,
    env,
  }: RuntimeOptions): Promise<void> {
    const host: Host = overriddenHost || new ConsoleHost();
    const exit: ExitFn = overriddenExit || process.exit;

    function errorExit(error: any): void {
      exit(
        typeof error.exitCode === 'number' ? error.exitCode : ExitCode.Software,
      );
    }

    function errorHandler(error: any): void {
      reportError(error, host);
      errorExit(error);
    }

    await tracer.span('cli', async () => {
      //
      // Errors in the main coroutine should be correctly handled. However,
      // we also need to handle errors thrown by unmanaged EventEmitters and/or
      // Promises that aren't awaited in the main coroutine.
      //
      process.on('uncaughtException', errorHandler);
      process.on('unhandledRejection', errorHandler);

      try {
        const config = cli.parseArgs(argv, env);
        host.setLevel(config.level);
        await cli.run(config, host);
      } catch (err) {
        reportError(err, host);
        error = err;
      }

      process.removeListener('uncaughtException', errorHandler);
      process.removeListener('unhandledRejection', errorHandler);
    });

    if (error) {
      errorExit(error);
      return;
    }

    // For consistency, explicitly exit instead of allowing Node to run the
    // command to completion.
    exit(0);
  };
}

/**
 * Report an error.
 *
 * @param err The object to report as an error.
 * @param host A Host instance.
 */
export function reportError(err: any, host: Host): void {
  tracer.spanSync('reportError', () => {
    if (err instanceof UsageFault) {
      host.writeLine(err);
    }

    // Handle intentional exits.
    if (err instanceof Exit) {
      // TODO: Should the user be able to access this log in a release build?
      tracer.trace(`Exit ${err.exitCode}`);
      if (err.message.length) {
        host.writeInfo(err.message);
      }
      return;
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
  });
}
