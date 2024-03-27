/**
 * A traceback, as seen in errors.
 *
 * See: https://docs.python.org/fr/3.11/reference/datamodel.html#traceback-objects
 */
export interface Traceback {
  next: Traceback | null;
  frame: Frame;
  lineNo: number;
}

/**
 * Objects implementing this interface have a traceback.
 */
export interface Traceable {
  traceback: Traceback | null;
}

/**
 * A stack frame, as seen in tracebacks.
 * See: https://docs.python.org/3.11/reference/datamodel.html#frame-objects
 */
export interface Frame {
  previous: Frame | null;
  // See: https://docs.python.org/3.11/reference/datamodel.html#code-objects
  // code: Code;
}
