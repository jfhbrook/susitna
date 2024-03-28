import {
  BaseException,
  Exception,
  AssertionError,
  RuntimeError,
  NotImplementedError,
  BaseWarning,
  Warning,
  DeprecationWarning,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from '../exceptions';

export function formatException(exc: BaseException): string {
  if (exc instanceof BaseWarning) {
    return formatWarning(exc);
  }

  if (exc instanceof AssertionError) {
    return formatAssertionError(exc);
  }
  if (exc instanceof FileError) {
    return formatFileError(exc);
  }
  if (exc instanceof OsError) {
    return formatOsError(exc);
  }
  if (exc instanceof SyntaxError) {
    return formatSyntaxError(exc);
  }
  if (exc instanceof ParseError) {
    return formatParseError(exc);
  }

  return formatSimpleException(exc);
}

export function formatWarning(warn: BaseWarning): string {
  if (warn instanceof SyntaxWarning) {
    return formatSyntaxWarning(warn);
  }
  if (warn instanceof ParseWarning) {
    return formatParseWarning(warn);
  }

  return formatSimpleWarning(warn);
}

//
// Simple exceptions and warnings.
//

export function formatSimpleException(exc: BaseException): string {
  let report = '';

  if (exc.traceback) {
    report += 'Traceback:\n';
    let tb = exc.traceback;
    while (tb) {
      report += `  File "${tb.frame.code.filename}", line ${tb.lineNo}\n`;
      tb = tb.next;
    }
  }

  report += `${exc.constructor.name}: ${exc.message}`;
  return report;
}

export function formatSimpleWarning(warn: BaseWarning): string {
  return formatSimpleException(warn);
}

export function formatAssertionError(exc: AssertionError): string {
  return formatSimpleException(exc);
}

//
// OS and file errors.
//

export function formatOsError(exc: OsError): string {
  return formatSimpleException(exc);
}

export function formatFileError(exc: FileError): string {
  return formatSimpleException(exc);
}

//
// Syntax and parse errors and warnings.
//

export function formatSyntaxError(exc: SyntaxError): string {
  return formatSimpleException(exc);
}

export function formatParseError(exc: ParseError): string {
  return formatSimpleException(exc);
}

export function formatSyntaxWarning(warn: SyntaxWarning): string {
  return formatSimpleWarning(warn);
}

export function formatParseWarning(warn: ParseWarning): string {
  return formatSimpleWarning(warn);
}
