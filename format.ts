import {
  BaseException,
  AssertionError,
  BaseWarning,
  OsError,
  FileError,
  SourceLocation,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from './exceptions';
import { Exit } from './exit';
import { BaseFault, RuntimeFault, UsageFault } from './faults';
import { Traceback, Frame, Code } from './traceback';

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

  abstract formatTraceback(traceback: Traceback | null): string;
  abstract formatFrame(frame: Frame): string;
  abstract formatCode(code: Code): string;

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

export function inspectString(str: string): string {
  if (str.includes("'")) {
    if (str.includes('"')) {
      return `'${str.replace(/'/g, "\\'")}'`;
    }
    return `"${str}"`;
  }
  return `'${str}'`;
}

export class DefaultFormatter extends Formatter {
  formatString(str: string): string {
    return str;
  }

  formatNumber(num: number): string {
    return String(num);
  }

  formatBoolean(bool: boolean): string {
    return String(bool);
  }

  formatTraceback(traceback: Traceback | null): string {
    let report = '';
    let tb = traceback;
    if (tb) {
      report += 'Traceback:\n';
    }
    // TODO: Python also prints the module name
    while (tb) {
      // TODO: inspect string, quotes etc
      report += `  File ${inspectString(tb.frame.code.filename)}, line ${tb.lineNo}`;
      tb = tb.next;
    }
    return report;
  }

  formatFrame(frame: Frame): string {
    return `Frame(${this.format(frame.code)})`;
  }

  formatCode(code: Code): string {
    return `Code(${inspectString(code.filename)})`;
  }

  formatBaseException(exc: BaseException): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report += `${exc.constructor.name}: ${exc.message}`;
    return report;
  }

  formatBaseWarning(warn: BaseWarning): string {
    let report = '';
    if (warn.traceback) {
      report += `${warn.traceback.frame.code.filename}:${warn.traceback.lineNo}`;
    } else {
      report += '<unknown>:<?>';
    }

    report += `: ${warn.constructor.name}: ${warn.message}`;
    // TODO: Python also prints the line like so:
    //
    //  100 print someFn(ident);

    return report;
  }

  formatAssertionError(exc: AssertionError): string {
    return this.formatBaseException(exc);
  }

  formatOsError(exc: OsError): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report += `${exc.constructor.name} ${exc.code}: ${exc.message}`;
    return report;
  }

  formatFileError(exc: FileError): string {
    let report = '';

    if (exc.traceback) {
      report += this.format(exc.traceback);
      report += '\n';
    }

    report += `${exc.constructor.name} ${exc.code}: ${exc.message}\n`;

    if (exc.paths.length == 2) {
      report += `  Source File: ${exc.paths[0]}\n`;
      report += `  Destination File: ${exc.paths[1]}`;
    } else {
      report += `  Input File: ${exc.paths[0]}`;
    }

    return report;
  }

  private formatSyntaxIssue(
    level: string,
    message: string,
    loc: SourceLocation,
  ): string {
    let report = `${loc.filename}:${loc.lineNo}:${loc.offset}: ${level}: ${message}\n`;
    report += `  ${loc.source}\n`;
    for (let i = 0; i <= loc.offset; i++) {
      report += ' ';
    }
    report += '^';
    return report;
  }

  formatSyntaxError(exc: SyntaxError): string {
    return this.formatSyntaxIssue('error', exc.message, exc);
  }

  formatParseError(exc: ParseError): string {
    return exc.errors
      .map((err: SyntaxError | SyntaxWarning) => this.format(err))
      .join('\n');
  }

  formatSyntaxWarning(warn: SyntaxWarning): string {
    return this.formatSyntaxIssue('warning', warn.message, warn);
  }

  formatParseWarning(warn: ParseWarning): string {
    return warn.warnings.map((w: SyntaxWarning) => this.format(w)).join('\n');
  }

  formatBaseFault(fault: BaseFault): string {
    let report = '=== INTERNAL FAULT ===\n\n';
    report += '--- Internal Stack Trace ---\n';
    report += fault.stack;
    return report;
  }

  formatRuntimeFault(fault: RuntimeFault): string {
    let report = '=== RUNTIME FAULT ===\n\n';
    report +=
      'This is a bug in Matanuska BASIC. If you copy this entire message and post it\n';
    report += 'to the issues tracker:\n\n';
    report += '    https://github.com/jfhbrook/matanuska/issues\n\n';
    report +=
      'the developers will do their best to fix it - and more importantly, they will\n';
    report += 'owe you a beer, coffee or beverage of your choice. 🍻\n\n';
    report += '--- Internal Stack Trace ---\n';
    report += fault.stack;

    if (fault.traceback) {
      report += '\n\n--- Traceback ---\n';
      report += this.format(fault.traceback);
    }

    return report;
  }

  formatUsageFault(fault: UsageFault): string {
    return fault.message;
  }

  formatExit(exit: Exit): string {
    return exit.message;
  }
}

export const formatter = new DefaultFormatter();
