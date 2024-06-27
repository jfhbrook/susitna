import * as dotenv from 'dotenv';

import { MATBAS_BUILD } from './constants';

if (MATBAS_BUILD === 'debug') {
  dotenv.config();
}

import { getTracer } from './debug';
import { container, Container } from './container';
import { Config } from './config';
import { BaseException } from './exceptions';
import { BaseFault, RuntimeFault, UsageFault } from './faults';
import { ConsoleHost, Host } from './host';
import { Exit, ExitCode } from './exit';

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

//
// Run the REPL.
//
async function repl<H extends Host>({ executor, host }: Container<H>) {
  while (true) {
    try {
      const input = await executor.prompt();
      await executor.eval(input);
    } catch (err) {
      if (err instanceof BaseFault || err instanceof Exit) {
        throw err;
      }

      if (err instanceof BaseException) {
        host.writeException(err);
        continue;
      }

      throw RuntimeFault.fromError(err, null);
    }
  }
}

/**
 * The main entry point for the application.
 *
 * @param options Runtime options.
 */
export async function main({
  host: overriddenHost,
  exit: overriddenExit,
  argv,
  env,
}: RuntimeOptions): Promise<void> {
  tracer.open('main');
  const host: Host = overriddenHost || new ConsoleHost();
  const exit: ExitFn = overriddenExit || process.exit;

  let error: any = null;

  function errorExit(error: any): void {
    tracer.close();
    exit(
      typeof error.exitCode === 'number' ? error.exitCode : ExitCode.Software,
    );
  }

  function errorHandler(error: any): void {
    reportError(error, host);
    errorExit(error);
  }

  //
  // Errors in the main coroutine should be correctly handled. However,
  // we also need to handle errors thrown by unmanaged EventEmitters and/or
  // Promises that aren't awaited in the main coroutine.
  //
  process.on('uncaughtException', errorHandler);
  process.on('unhandledRejection', errorHandler);

  try {
    const config = Config.load(argv, env);
    host.setLevel(config.level);

    const deps = container(config, host);
    const { executor } = deps;

    await executor.using(async () => {
      if (config.script) {
        await executor.load(config.script);
        await executor.run();
      } else {
        await repl(deps);
      }
    });
  } catch (err) {
    reportError(err, host);
    error = err;
  }

  process.removeListener('uncaughtException', errorHandler);
  process.removeListener('unhandledRejection', errorHandler);

  if (error) {
    errorExit(error);
    return;
  }

  // For consistency, explicitly exit instead of allowing Node to run the
  // command to completion.
  exit(0);
}

/**
 * Report an error.
 *
 * @param err The object to report as an error.
 * @param host A Host instance.
 */
export function reportError(err: any, host: Host): void {
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
}
