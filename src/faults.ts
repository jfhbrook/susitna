import { errorType } from './errors';
import { Traceable, Traceback } from './traceback';
import { ExitCode, ExitCoded } from './sysexits';

type Value = any;

/**
 * A base class for all faults.
 */
@errorType('BaseFault')
export class BaseFault extends Error implements Traceable {
  /**
   * @param message The message for the fault.
   * @param traceback The traceback for the fault, if applicable.
   */
  constructor(
    message: Value,
    public readonly traceback: Traceback | null,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * A fault. Faults are a problem with the interpreter, not the source code,
 * and are always fatal.
 */
@errorType('Fault')
export class Fault extends BaseFault {}

/**
 * A fault for any JavaScript Error which can't be represented as an
 * Exception. All flagrant faults are indicative of interpreter bugs.
 */
@errorType('RuntimeFault')
export class RuntimeFault extends Fault implements ExitCoded {
  public exitCode = ExitCode.Software;

  /**
   * @param message The message for the fault.
   * @param error The underlying JavaScript error. This may be an
   *        assert.AssertionError.
   * @param traceback The traceback for the fault.
   */
  constructor(
    message: Value,
    public error: Error,
    traceback: Traceback | null,
  ) {
    super(message, traceback);
  }
}

/**
 * A fault raised when functionality is not implemented. Extends RuntimeFault.
 */
@errorType('NotImplementedFault')
export class NotImplementedFault extends RuntimeFault {}

/**
 * A fault raised when the command was called with invalid arguments.
 */
@errorType('UsageFault')
export class UsageFault extends Fault implements ExitCoded {
  public exitCode = ExitCode.Usage;

  constructor(message: string) {
    super(message, null);
  }
}
