import { errorType } from './errors';
import { ExitCode, ExitCoded } from './sysexits';

/**
 * When thrown, causes the program to exit successfully. Takes an optional
 * message.
 */
@errorType('Exit')
export class Exit extends Error implements ExitCoded {
  public readonly exitCode = ExitCode.Success;

  constructor(message?: string) {
    super(message || '');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
