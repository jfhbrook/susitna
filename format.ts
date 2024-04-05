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
import { Expr, ExprVisitor, IntLiteral, RealLiteral, BoolLiteral, StringLiteral } from './ast/expr';
import { Cmd, CmdVisitor, Print, Expression } from './ast/cmd';
import { Line } from './ast/line';
import { Program } from './ast/program';
import { MATBAS_VERSION, TYPESCRIPT_VERSION, NODE_VERSION } from './versions';

/**
 * Objects implementing this interface can be formatted.
 */
export interface Formattable {
  format(formatter: Formatter): string;
}

/**
 * Values of this type can be formatted.
 */
export type FormatValue = string | number | boolean | Expr | Cmd | Formattable;

/**
 * A formatter. This is an abstract class and should not be used directly.
 */
export abstract class Formatter {
  /**
   * Format a value.
   *
   * @param value A formattable value.
   */
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

    if (value instanceof Expr) {
      return this.formatExpr(value);
    }

    if (value instanceof Cmd) {
      return this.formatCmd(value);
    }

    return value.format(this);
  }

  //
  // This class implements a visitor pattern - all of these methods are
  // visitor methods for particular value types.
  //

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

  abstract formatLine(line: Line): string;
  abstract formatProgram(program: Program): string;
  abstract formatExpr(expr: Expr): string;
  abstract formatCmd(cmd: Cmd): string;
}

/**
 * Inspect a string. Includes the quotes and does escaping appropriately.
 */
export function inspectString(str: string): string {
  if (str.includes("'")) {
    if (str.includes('"')) {
      return `'${str.replace(/'/g, "\\'")}'`;
    }
    return `"${str}"`;
  }
  return `'${str}'`;
}


export class DefaultExprFormatter implements ExprVisitor<string> {
  visitIntLiteralExpr(int: IntLiteral): string {
    return String(int.value);
  }

  visitRealLiteralExpr(real: RealLiteral): string {
    return String(real.value);
  }

  visitBoolLiteralExpr(bool: BoolLiteral): string {
    return String(bool.value);
  }

  visitStringLiteralExpr(node: StringLiteral): string {
    return inspectString(node.value);
  }
}

const defaultExprFormatter = new DefaultExprFormatter();

export class DefaultCmdFormatter implements CmdVisitor<string> {

  visitExpressionCmd(node: Expression): string {
    return `Expression(${node.expression.accept(defaultExprFormatter)})`;
  }

  visitPrintCmd(node: Print): string {
    return `Print(${node.expression.accept(defaultExprFormatter)})`;
  }
}

const defaultCmdFormatter = new DefaultCmdFormatter();

/**
 * A default, standard formatter.
 */
export class DefaultFormatter extends Formatter {
  constructor() {
    super();
  }

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
    let lineNo: string;
    let lineNote: string = '';
    if (loc.isLine) {
      lineNo = String(loc.lineNo);
    } else if (loc.lineNo > 0) {
      lineNo = `<R${loc.row}>`;
      lineNote = ` (after line ${loc.lineNo})`;
    } else {
      lineNo = `<R${loc.row}>`;
      lineNote = ` (at the beginning)`;
    }
    let report = `${loc.filename}:${lineNo}:${loc.offsetStart}${lineNote}: ${level}: ${message}\n`;
    report += `  ${loc.source}\n`;
    for (let i = 0; i <= loc.offsetStart; i++) {
      report += ' ';
    }
    report += '^';
    return report;
  }

  formatSyntaxError(exc: SyntaxError): string {
    return this.formatSyntaxIssue('error', this.format(exc.message), exc);
  }

  formatParseError(exc: ParseError): string {
    return exc.errors
      .map((err: SyntaxError | SyntaxWarning) => this.format(err))
      .join('\n');
  }

  formatSyntaxWarning(warn: SyntaxWarning): string {
    return this.formatSyntaxIssue('warning', this.format(warn.message), warn);
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
    report += '--- Internal Stack Trace ---\n';
    report += fault.error.stack;

    if (fault.traceback) {
      report += '\n\n--- Traceback ---\n';
      report += this.format(fault.traceback);
    }
    report += '\n\n--- Versions ---\n';
    report += `Matanuska BASIC: v${MATBAS_VERSION}\n`;
    report += `TypeScript: v${TYPESCRIPT_VERSION}\n`;
    report += `Node.js: v${NODE_VERSION}\n\n`;
    report +=
      'This is a bug in Matanuska BASIC. If you copy this entire message and post it\n';
    report += 'to the issues tracker:\n\n';
    report += '    https://github.com/jfhbrook/matanuska/issues\n\n';
    report +=
      'the developers will do their best to fix it - and more importantly, they will\n';
    report += 'owe you a beer, coffee or beverage of your choice. 🍻\n\n';

    return report;
  }

  formatUsageFault(fault: UsageFault): string {
    return fault.message;
  }

  formatExit(exit: Exit): string {
    return exit.message;
  }

  private formatIndentedLine(indent: number, line: Line): string {
    let tab = '';
    for (let i = 0; i < indent; i++) {
      tab += '  ';
    }
    let formatted = `${tab}Line(\n  ${line.lineNo}) [`;
    let cmds: string[] = [];
    for (let cmd of line.commands) {
      cmds.push(cmd.accept(defaultCmdFormatter));
    }
    for (let cmd of cmds) {
      formatted += `\n${tab}  ${cmd},`;
    }
    formatted += '\n]';

    return formatted;
  }

  formatLine(line: Line): string {
    return this.formatIndentedLine(0, line);
  }

  formatProgram(program: Program): string {
    let formatted = 'Program(\n';
    let lines: string[] = [];
    for (let line of program.lines) {
      lines.push(this.formatIndentedLine(1, line));
    }
    for (let line of lines) {
      formatted += `\n  ${line},`;
    }
    formatted += '\n)';
    return formatted;
  }

  formatExpr(expr: Expr): string {
    return expr.accept(defaultExprFormatter);
  }

  formatCmd(cmd: Cmd): string {
    return cmd.accept(defaultCmdFormatter);
  }
}

/**
 * The default formatter, initialized for your convenience.
 */
export const formatter = new DefaultFormatter();
