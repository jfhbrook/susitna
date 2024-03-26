import { Traceback } from './traceback';

type Value = any;

/**
 * A system exit code, as in sysexits.h.
 *
 * There are no hard and fast rules for how these map to OS errors, as far
 * as I know, and in fact this standard is not commonly implemented.
 *
 * See: https://man.freebsd.org/cgi/man.cgi?query=sysexits&manpath=FreeBSD+4.3-RELEASE
 */
export enum ExitCode {
  /**
   * The command was used incorrectly, e.g., with the wrong number of
   * arguments, a bad flag, a bad syntax in a parameter, or whatever.
   */
  Usage = 64,

  /**
   * The input data was incorrect in some way. This should only be used for
   * the user's data and not system files.
   */
  DataError = 65,

  /**
   * An input file (not a system file) did not exist or was not readable. This
   * could also include errors like "No message" to a mailer (if it cared to
   * catch it).
   */
  NoInput = 66,

  /**
   * The user specified did not exist. This might be used for mail addresses
   * or remote logins.
   */
  NoUser = 67,

  /**
   * The host specified did not exist. This is used in mail addresses or
   * network requests.
   */
  NoHost = 68,

  /**
   * A service is unavailable. This can occur if a support program or file
   * does not exist. This can also be used as a catchall message when something
   * you wanted to do doesn't work, but you don't know why.
   */
  Unavailable = 69,

  /**
   * An internal software error has been detected. This should be limited to
   * non-operating system related errors as possible.
   *
   * If an exception does not otherwise specify an exit code, this exit code
   * will be used.
   */
  Software = 70,

  /**
   * An operating system error has been detected. This is intended to be used
   * for such things as "cannot fork", "cannot create pipe", or the like. It
   * includes things like getuid returning a user that does not exist in the
   * passwd file.
   */
  OsError = 71,

  /**
   * Some system file (e.g., /etc/passwd, /var/run/utmp, etc.) does not exist,
   * cannot be opened, or has some sort of error (e.g., syntax error).
   */
  OsFile = 72,

  /**
   * A (user specified) output file cannot be created.
   */
  CantCreate = 73,

  /**
   * An error occurred while doing I/O on some file.
   */
  IoError = 74,

  /**
   * Temporary failure, indicating something that is not really an error. In
   * sendmail, this means that a mailer (e.g.) could not create a connection,
   * and the request should be reattempted later.
   */
  TempFail = 75,

  /**
   * The remote system returned something that was "not possible" during a
   * protocol exchange.
   */
  Protocol = 76,

  /**
   * You did not have sufficient permission to perform the operation. This is
   * not intended for file system problems, which should use
   * ExitCode.NoInput or ExitCode.CantCreate, but rather for higher-level
   * permissions.
   */
  NoPermission = 77,

  /**
   * Something was found in an unconfigured or misconfigured state.
   */
  Config = 78,
}

/**
 * An interface implemented by exceptions which have an exit code corresponding
 * to sysexits.h.
 */
export interface ExitCodeException {
  /**
   * A system exit code, as per sysexits.h. If this exception causes the
   * interpreter to exit, this will be the process exit code.
   */
  exitCode: ExitCode;
}

/**
 * The base class for all Exceptions, including fatal exceptions.
 */
export class BaseException {
  /**
   * @param message The message for the exception.
   * @param traceback The traceback for the exception.
   */
  constructor(
    public readonly message: Value,
    public readonly traceback: Traceback,
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
 * An OS error code.
 *
 * These are conceptually similar to C error codes, as in errno.h. However,
 * they are actually based on libuv errors and further refined in Node.JS core.
 * Most of these map to errno.h on POSIX, but differ on Windows.
 *
 * This type is non-exhaustive, and is based on Node.js's documented "Common
 * system errors" combined with any errors I encounter in practice.
 *
 * See: https://nodejs.org/api/errors.html#common-system-errors
 */
export enum ErrorCode {
  Access = 'EACCES',
  AddressInUse = 'EADDRINUSE',
  ConnectionRefused = 'ECONNREFUSED',
  ConnectionReset = 'ECONNRESET',
  Exists = 'EEXIST',
  IsDirectory = 'EISDIR',
  MaxFileDescriptors = 'EMFILE',
  NoEntity = 'ENOENT',
  NotADirectory = 'ENOTDIR',
  NotEmpty = 'ENOTEMPTY',
  DnsNotFound = 'ENOTFOUND',
  NotPermitted = 'EPERM',
  BrokenPipe = 'EPIPE',
  TimedOut = 'ETIMEDOUT',
}

/**
 * An operating system level error.
 */
export class OsError extends Exception implements ExitCodeException {
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
    public readonly traceback: Traceback,
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
        case ErrorCode.BrokenPipe:
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.TimedOut:
          // NOTE: Unavailable is appropriate for network timeouts. For other
          // kinds of timeout, there may be better exit codes.
          this.exitCode = ExitCode.Unavailable;
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
    public traceback: Traceback,
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
    traceback: Traceback,
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
    traceback: Traceback,
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
    traceback: Traceback,
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
    traceback: Traceback,
  ) {
    super(message, traceback);
  }
}

/**
 * A parse error. May contain one or more syntax errors or warnings.
 */
export class ParseError extends Exception {
  /**
   * @param message The message for the exception.
   * @param errors A collection of syntax errors and warnings.
   * @param traceback The traceback for the exception.
   */
  constructor(
    message: Value,
    public errors: Array<SyntaxError | SyntaxWarning>,
    traceback: Traceback,
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
    public endLineNo: number | null,
    public endOffset: number | null,
    traceback: Traceback,
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
    traceback: Traceback,
  ) {
    super(message, traceback);
  }
}

//
// Fatal errors.
//

/**
 * A fatal exception. These exceptions may not be caught and always crash the
 * interpreter.
 */
export class FatalException extends BaseException {}

/**
 * An error for any JavaScript error which can't be reified into an
 * Exception. All flagrant errors are indicative of interpreter bugs.
 */
export class FlagrantError extends FatalException {
  /**
   * @param message The message for the exception.
   * @param error The underlying JavaScript error.
   * @param traceback The traceback for the exception.
   */
  constructor(
    message: Value,
    public error: any,
    traceback: Traceback,
  ) {
    super(message, traceback);
  }
}

/**
 * An error raised when the command was called with invalid arguments.
 */
export class UsageError extends FatalException implements ExitCodeException {
  public exitCode = ExitCode.Usage;
}
