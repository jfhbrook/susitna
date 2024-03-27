import { ExitCode, ExitCoded } from './sysexits';

/**
 * When thrown, causes the program to exit successfully. Takes an optional
 * message.
 */
export class Exit extends Error implements ExitCoded {
  public readonly exitCode = ExitCode.Success;

  constructor(message?: string) {
    super(message || '');
  }
}
