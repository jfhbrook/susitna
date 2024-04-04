import { inspect } from 'util';

/**
 * A debug tracer. Used for internal development.
 */
export class Tracer {
  public enabled = false;
  private spans: number = 0;

  /**
   * Enable tracing.
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable tracing.
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Manually open a new span. Typically, you would use the `span` method
   * instead.
   *
   * @param name The name of the span.
   */
  open(name: string): void {
    if (this.enabled) {
      this.trace(name);
      this.spans++;
    }
  }

  /**
   * Manually close the current span. Typically, you would use the `span`
   * method instead.
   *
   * @param name The name of the span.
   */
  close(): void {
    if (this.enabled) {
      this.spans--;
    }
  }

  /**
   * Run the async function inside a new span.
   *
   * @param name The name of the span.
   * @param fn An async function to run inside the span.
   * @returns The return value of the async function.
   */
  async span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (this.enabled) {
      this.open(name);

      const rv = await fn();

      this.close();

      return rv;
    }

    return fn();
  }

  /**
   * Log a trace.
   *
   * @param message The message to log.
   * @param ...args Additional arguments passed to `console.log`.
   */
  trace(message: any, ...args: any[]) {
    if (this.enabled) {
      let prefix = 'TRACE ';
      if (this.spans) {
        for (let i = 0; i < this.spans; i++) {
          prefix += ': ';
        }
        prefix += '|- ';
      }
      const msg: string[] = inspect(message).split('\n');
      for (let row of msg) {
        console.log(prefix + row, ...args);
      }
    }
  }
}

export const tracer = new Tracer();
