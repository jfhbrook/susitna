import { Formattable, Formatter } from './format';

/**
 * A traceback, as seen in errors.
 *
 * See: https://docs.python.org/fr/3.11/reference/datamodel.html#traceback-objects
 */
export class Traceback implements Formattable {
  constructor(
    public readonly next: Traceback | null,
    public frame: Frame,
    public lineNo: number,
  ) {}

  format(formatter: Formatter): string {
    return formatter.formatTraceback(this);
  }
}

/**
 * Objects implementing this interface have a traceback.
 */
export interface Traceable {
  traceback: Traceback | null;
}

/**
 * A code object, as seen in tracebacks.
 *
 * See: https://docs.python.org/fr/3.11/reference/datamodel.html#code-objects
 */
export class Code implements Formattable {
  constructor(public readonly filename: string) {}

  format(formatter: Formatter): string {
    return formatter.formatCode(this);
  }
}

/**
 * A stack frame, as seen in tracebacks.
 *
 * See: https://docs.python.org/3.11/reference/datamodel.html#frame-objects
 */
export class Frame implements Formattable {
  constructor(
    public readonly previous: Frame | null,
    public code: Code,
  ) {}

  format(formatter: Formatter): string {
    return formatter.formatFrame(this);
  }
}
