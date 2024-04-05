import { inspect } from 'util';

import { MATBAS_BUILD } from './constants';
import { parseBoolEnv } from './env';

//
// Active tracers.
//
let TRACERS: Record<string, Tracer> = {};

/**
 * A debug tracer. Used for internal development.
 */
export class Tracer {
  private spans: number = 0;

  constructor(private name: string = 'main') {}

  /**
   * Manually open a new span.
   *
   * @param name The name of the span.
   */
  open(name: string): void {
    this.trace(name);
    this.spans++;
  }

  /**
   * Manually close the current span.
   *
   * @param name The name of the span.
   */
  close(): void {
    this.spans--;
  }

  trace(message: any, ...args: any[]): void {
    let prefix = `TRACE <${this.name}> `;
    if (this.spans) {
      for (let i = 0; i < this.spans; i++) {
        prefix += '| ';
      }
      prefix += '|- ';
    }

    let msg: string[];
    if (typeof message === 'string') {
      msg = message.split('\n');
    } else {
      msg = inspect(message).split('\n');
    }

    for (let arg of args) {
      let inspected: string;
      if (typeof arg === 'string') {
        inspected = arg;
      } else {
        inspected = inspect(arg);
      }
      const sp = inspected.split('\n');
      if (sp.length) {
        msg[msg.length - 1] += ' ' + sp.shift();
        msg = msg.concat(sp);
      }
    }
    for (let row of msg) {
      console.log(prefix + row);
    }
  }

  /**
   * Destroy the tracer. If getTracer is called again for the same tracer,
   * it will now be a fresh tracer.
   */
  destroy(): void {
    if (TRACERS[this.name] && this.name !== 'main') {
      TRACERS[this.name] = undefined;
    }
  }
}

/**
 * A no-op tracer. Returned by getTracer calls in release builds.
 */
export class NoopTracer extends Tracer {
  open(name: string): void {}

  close(): void {}

  trace(message: any, ...args: any[]): void {}

  destroy(): void {}
}

/**
 * Log a trace.
 *
 * @param message The message to log.
 * @param ...args Additional arguments passed to `console.log`.
 */
let trace = function trace(message: any, ...args: any[]): void {};

/**
 * Run an async function inside a new span.
 *
 * @param name The name of the span.
 * @param fn An async function to run inside the span.
 * @returns The return value of the async function.
 */
let span = async function span<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  return fn();
};

/**
 * Run a sync function inside a new span.
 *
 * @param name The name of the span.
 * @param fn A function to run inside the span.
 * @returns The return value of the function.
 */
let spanSync = function spanSync<T>(name: string, fn: () => T): T {
  return fn();
};

let NOOP_TRACER = null;

/**
 * Get a child tracer. Call this to trace async execution outside the main
 * coroutine.
 *
 * @paran name The name of the child tracer.
 */
let getTracer = function getTracer(name: string): Tracer {
  if (!NOOP_TRACER) {
    NOOP_TRACER = new NoopTracer();
  }
  return NOOP_TRACER;
};

if (MATBAS_BUILD === 'debug') {
  if (parseBoolEnv(process.env.TRACE)) {
    const tracer = new Tracer();

    TRACERS['main'] = tracer;

    trace = function trace(message: any, ...args: any[]): void {
      return tracer.trace(message, ...args);
    };

    span = async function span<T>(
      name: string,
      fn: () => Promise<T>,
    ): Promise<T> {
      tracer.open(name);

      let rv: T;
      try {
        rv = await fn();
      } finally {
        tracer.close();
      }

      return rv;
    };

    spanSync = function spanSync<T>(name: string, fn: () => T): T {
      tracer.open(name);

      let rv: T;
      try {
        rv = fn();
      } finally {
        tracer.close();
      }

      return rv;
    };

    getTracer = function getTracer(name: string): Tracer {
      if (!TRACERS[name]) {
        TRACERS[name] = new Tracer(name);
      }
      return TRACERS[name];
    };
  }
}

export { trace, span, spanSync, getTracer };
