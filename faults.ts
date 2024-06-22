import { errorType } from './errors';
import { BaseException, Exception } from './exceptions';
import { ExitCode, ExitCoded } from './exit';
import { Formattable, Formatter, formatter } from './format';
import { Traceable, Traceback } from './traceback';

/**
 * A base class for all faults.
 */
@errorType('BaseFault')
export class BaseFault extends Error implements Traceable, Formattable {
  /**
   * @param message The message for the fault.
   * @param traceback The traceback for the fault, if applicable.
   */
  constructor(
    message: any,
    public traceback: Traceback | null,
  ) {
    super(formatter.format(message));
    Object.setPrototypeOf(this, new.target.prototype);
  }

  format(formatter: Formatter): string {
    return formatter.formatBaseFault(this);
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
    message: any,
    public error: Error,
    traceback: Traceback | null,
  ) {
    super(message, traceback);
  }

  static fromError(err: any, traceback: Traceback | null): RuntimeFault {
    let message = 'Unspecified error';
    if (typeof err.message === 'undefined') {
      if (err.format) {
        try {
          message = formatter.format(err);
        } catch (err) {
          message = String(err);
        }
      } else {
        message = String(err);
      }
    } else if (typeof err.message === 'string') {
      message = err.message;
    } else if (err.format) {
      try {
        message = formatter.format(err.message);
      } catch (err) {
        message = String(err.message);
      }
    } else {
      message = String(err.message);
    }

    if (!(err instanceof Error)) {
      err = new Error(message);
    }

    return new RuntimeFault(message, err, traceback);
  }

  static fromException(exc: BaseException): RuntimeFault {
    return new RuntimeFault(
      exc.message,
      new Error(`Uncaught ${exc.constructor.name}: ${exc.message}`),
      exc.traceback,
    );
  }

  format(formatter: Formatter): string {
    return formatter.formatRuntimeFault(this);
  }
}

/**
 * A fault raised when functionality is not implemented. Extends RuntimeFault.
 */
@errorType('NotImplementedFault')
export class NotImplementedFault extends RuntimeFault {
  constructor(message: any, traceback: Traceback | null) {
    super(message, new Error(), traceback);
    this.error = this;
  }
}

/**
 * A fault raised when the command was called with invalid arguments.
 */
@errorType('UsageFault')
export class UsageFault extends Fault implements ExitCoded {
  public exitCode = ExitCode.Usage;

  constructor(message: string) {
    super(message, null);
  }

  format(formatter: Formatter): string {
    return formatter.formatUsageFault(this);
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function runtimeMethod<F extends Function>(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const fn: F = descriptor.value;
  const wrapped: F = function captured(...args: any[]): any {
    try {
      return fn.apply(this, args);
    } catch (err) {
      if (err instanceof Exception) {
        throw err;
      }

      if (!(err instanceof BaseFault)) {
        throw RuntimeFault.fromError(err, null);
      }
      throw err;
    }
  } as unknown as F;

  descriptor.value = wrapped;
}
