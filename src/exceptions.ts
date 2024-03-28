import { ExitCode, ExitCoded } from './exit';
import { ErrorCode } from './errors';
import { Traceable, Traceback } from './traceback';

type Value = any;

/**
 * The base class for all Exceptions, including fatal exceptions.
 */
export class BaseException implements Traceable {
  /**
   * @param message The message for the exception.
   * @param traceback The traceback for the exception.
   */
  constructor(
    public readonly message: Value,
    public readonly traceback: Traceback | null,
  ) {
    // TODO: Exceptions in Python store all args the constructor is called
    // with, not just a message.
    // TODO: Implement notes a la Python?
    // See: https://docs.python.org/3/tutorial/errors.html#enriching-exceptions-with-notes
  }
}

/**
 * The base class for all built-in, non-fatal exceptions. User
 * exceptions should be derived from this class.
 */
export class Exception extends BaseException {}

//
// Non-fatal errors.
//

/**
 * An exception raised by an assertion.
 */
export class AssertionError extends Exception {}

/**
 * An exception raised on errors in the runtime.
 */
export class RuntimeError extends Exception {}

/**
 * An exception raised when functionality is not implemented. Extends
 * RuntimeError.
 */
export class NotImplementedError extends RuntimeError {}

//
// Warnings.
//

/**
 * The base class for all warnings. Warnings are non-fatal and can not be
 * caught.
 */
export class BaseWarning extends BaseException {}

/**
 * The base class for all user warnings.
 */
export class Warning extends BaseWarning {}

/**
 * A warning for deprecated functionality.
 */
export class DeprecationWarning extends Warning {}

//
// OS and file IO errors.
//

/**
 * An operating system level error.
 */
export class OsError extends Exception implements ExitCoded {
  public readonly exitCode: ExitCode;

  /**
   * @param message The message for the exception.
   * @param code The Node.JS system error code.
   * @param exitCode The exit code for the exception. If null, a default exit
   *        code will be set based on the error code.
   * @param traceback The traceback for the exception.
   */
  constructor(
    public readonly message: Value,
    public readonly code: ErrorCode | string,
    exitCode: ExitCode | null,
    public readonly traceback: Traceback | null,
  ) {
    super(message, traceback);

    if (exitCode) {
      this.exitCode = exitCode;
    } else {
      switch (code) {
        // NOTE: For FileErrors, ErrorCode.Access maps to ExitCode.NoInput
        // for read operations and ExitCode.CantCreate for write operations.
        case ErrorCode.Access:
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.AddressInUse:
          // There are arguments for this being Unavailable, OsError or
          // Software.
          this.exitCode = ExitCode.Protocol;
          break;
        case ErrorCode.ConnectionRefused:
        case ErrorCode.ConnectionReset:
          this.exitCode = ExitCode.Unavailable;
          break;
        case ErrorCode.Exists:
          this.exitCode = ExitCode.CantCreate;
          break;
        case ErrorCode.IsDirectory:
          this.exitCode = ExitCode.IoError;
          break;
        case ErrorCode.MaxFileDescriptors:
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.NoEntity:
          this.exitCode = ExitCode.NoInput;
          break;
        case ErrorCode.NotADirectory:
          this.exitCode = ExitCode.NoInput;
          break;
        case ErrorCode.NotEmpty:
          // TODO: There's an argument for this being an IoError.
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.DnsNotFound:
          this.exitCode = ExitCode.NoHost;
          break;
        case ErrorCode.NotPermitted:
          // NOTE: Assuming this will not be seen for user filesystem
          // permissions.
          this.exitCode = ExitCode.NoPermission;
          break;
        case ErrorCode.BrokenPipe:
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.TimedOut:
          // NOTE: Unavailable is appropriate for network timeouts. For other
          // kinds of timeout, there may be better exit codes.
          this.exitCode = ExitCode.Unavailable;
          break;
        default:
          this.exitCode = ExitCode.OsError;
      }
    }
  }
}

/**
 * The path(s) being used by an operations which raised a FileError.
 */
export type FileErrorPaths = [string] | [string, string];

/**
 * An error raised when a known file operation fails. Includes the target
 * filename(s) and a more specific exit code.
 */
export class FileError extends OsError {
  /**
   * @param message The message for the exception.
   * @param code The Node.JS system error code.
   * @param exitCode The exit code for the exception. If null, a default exit
   *        code will be set based on the error code.
   * @param paths The target path(s) for the operation.
   * @param traceback The traceback for the exception.
   */
  constructor(
    public message: Value,
    public code: ErrorCode | string,
    exitCode: ExitCode | null,
    public paths: FileErrorPaths,
    public traceback: Traceback | null,
  ) {
    super(message, code, exitCode, traceback);
  }

  /**
   * Naively create a FileError from a Node.js error.
   *
   * @param message The message for the error. If null, taken directly from
   * the Node.JS error.
   * @param err The Node.JS error.
   * @param traceback The traceback for the error.
   */
  static fromError(
    message: Value | null,
    err: NodeJS.ErrnoException,
    traceback: Traceback | null,
  ) {
    return new FileError(
      message || err.message,
      err.code,
      null,
      [err.path],
      traceback,
    );
  }

  /**
   * Create a FileError from a Node.js error for a read operation.
   *
   * @param message The message for the error. If null, taken directly from
   * the Node.JS error.
   * @param err The Node.JS error.
   * @param traceback The traceback for the error.
   */
  static fromReadError(
    message: Value | null,
    err: NodeJS.ErrnoException,
    traceback: Traceback | null,
  ) {
    const code = err.code;
    let exitCode: ExitCode | null = null;

    if (code == ErrorCode.Access) {
      exitCode = ExitCode.NoInput;
    }

    return new FileError(
      message || err.message,
      err.code,
      exitCode,
      [err.path],
      traceback,
    );
  }

  /**
   * Create a FileError from a Node.js error for a write operation.
   *
   * @param message The message for the error. If null, taken directly from
   * the Node.JS error.
   * @param err The Node.JS error.
   * @param traceback The traceback for the error.
   */
  static fromWriteError(
    message: Value | null,
    err: NodeJS.ErrnoException,
    traceback: Traceback | null,
  ) {
    const code = err.code;
    let exitCode: ExitCode | null = null;

    if (code == ErrorCode.Access) {
      exitCode = ExitCode.CantCreate;
    }

    return new FileError(
      message || err.message,
      err.code,
      exitCode,
      [err.path],
      traceback,
    );
  }
}

//
// Syntax and parse errors and warnings.
//

/**
 * The location referenced by a syntax error or warning.
 */
export interface SyntaxLocation {
  /**
   * The filename for the source code. This may be <interactive> for
   * interactive code, or <untitled> if the edited code has not been saved.
   */
  filename: string;

  /**
   * The line number in the source code. For interactive code, this will be
   * based on how many interactive commands have been entered.
   */
  lineNo: number;

  /**
   * The column offset in the source code.
   */
  offset: number;

  /**
   * The referenced source code. Will typically be a line or interactive
   * command.
   */
  source: string;

  // endLineNo: number | null,
  // endOffset: number | null
}

/**
 * An individual syntax error. Typically there will be multiple syntax errors
 * or warnings encapsulated in a ParseError.
 */
export class SyntaxError extends Exception implements SyntaxLocation {
  /**
   * @param message The message for the exception.
   * @param filename The filename for the source code.
   * @param lineNo The line number in the source code.
   * @param offset The column offset in the source code.
   * @param source The referenced source code.
   * @param traceback The traceback for the exception.
   */
  constructor(
    message: Value,
    public filename: string,
    public lineNo: number,
    public offset: number,
    public source: string,
    traceback: Traceback | null,
  ) {
    super(message, traceback);
  }
}

/**
 * A parse error. May contain one or more syntax errors or warnings.
 */
export class ParseError extends Exception implements ExitCoded {
  public exitCode = ExitCode.Software;

  /**
   * @param message The message for the exception.
   * @param errors A collection of syntax errors and warnings.
   * @param traceback The traceback for the exception.
   */
  constructor(
    message: Value,
    public errors: Array<SyntaxError | SyntaxWarning>,
    traceback: Traceback | null,
  ) {
    super(message, traceback);
  }
}

/**
 * A syntax warning. These warnings are non-fatal, but are likely undesirable.
 */
export class SyntaxWarning extends Warning implements SyntaxLocation {
  /**
   * @param message The message for the exception.
   * @param filename The filename for the source code.
   * @param lineNo The line number in the source code.
   * @param offset The column offset in the source code.
   * @param source The referenced source code.
   * @param traceback The traceback for the exception.
   */
  constructor(
    message: Value,
    public filename: string,
    public lineNo: number,
    public offset: number,
    public source: string,
    traceback: Traceback | null,
  ) {
    super(message, traceback);
  }
}

/**
 * A parse warning. This is analogous to a syntax error, but contains only
 * warnings.
 */
export class ParseWarning extends Exception {
  /**
   * @param message The message for the exception.
   * @param warnings A collection of syntax warnings.
   * @param traceback The traceback for the exception.
   */
  constructor(
    message: Value,
    public warnings: Array<SyntaxWarning>,
    traceback: Traceback | null,
  ) {
    super(message, traceback);
  }
}
