import {
  BaseException,
  AssertionError,
  BaseWarning,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { Exit } from './exit';
import { BaseFault, RuntimeFault, UsageFault } from './faults';

export interface Formattable {
  format(formatter: Formatter): string;
}

export type FormatValue = string | number | boolean | Formattable;

export abstract class Formatter {
  format(value: FormatValue): string {
    if (typeof value === 'string') {
      return this.formatString(value);
    }

    if (typeof value === 'number') {
      return this.formatNumber(value);
    }

    if (typeof value == 'boolean') {
      return this.formatBoolean(value);
    }

    return value.format(this);
  }

  abstract formatString(value: string): string;
  abstract formatNumber(value: number): string;
  abstract formatBoolean(value: boolean): string;

  abstract formatBaseException(exc: BaseException): string;
  abstract formatBaseWarning(warn: BaseWarning): string;
  abstract formatAssertionError(exc: AssertionError): string;
  abstract formatOsError(exc: OsError): string;
  abstract formatFileError(exc: FileError): string;
  abstract formatSyntaxError(exc: SyntaxError): string;
  abstract formatParseError(exc: ParseError): string;
  abstract formatSyntaxWarning(warn: SyntaxWarning): string;
  abstract formatParseWarning(warn: ParseWarning): string;

  abstract formatBaseFault(fault: BaseFault): string;
  abstract formatRuntimeFault(fault: RuntimeFault): string;
  abstract formatUsageFault(fault: UsageFault): string;

  abstract formatExit(exit: Exit): string;
}

export class PrettyFormatter extends Formatter {
  formatString(str: string): string {
    return str;
  }

  formatNumber(num: number): string {
    return String(num);
  }

  formatBoolean(bool: boolean): string {
    return String(bool);
  }

  formatBaseException(exc: BaseException): string {
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

  formatBaseWarning(warn: BaseWarning): string {
    return this.formatBaseException(warn);
  }

  formatAssertionError(exc: AssertionError): string {
    return this.formatBaseException(exc);
  }

  formatOsError(exc: OsError): string {
    return this.formatBaseException(exc);
  }

  formatFileError(exc: FileError): string {
    return this.formatBaseException(exc);
  }

  formatSyntaxError(exc: SyntaxError): string {
    return this.formatBaseException(exc);
  }

  formatParseError(exc: ParseError): string {
    return this.formatBaseException(exc);
  }

  formatSyntaxWarning(warn: SyntaxWarning): string {
    return this.formatBaseWarning(warn);
  }

  formatParseWarning(warn: ParseWarning): string {
    return this.formatBaseWarning(warn);
  }

  formatBaseFault(fault: BaseFault): string {
    return fault.stack;
  }

  formatRuntimeFault(fault: RuntimeFault): string {
    return this.formatBaseFault(fault);
  }

  formatUsageFault(fault: UsageFault): string {
    return fault.message;
  }

  formatExit(exit: Exit): string {
    return exit.message;
  }
}
