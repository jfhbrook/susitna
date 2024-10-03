import { LoggerService, Injectable } from '@nestjs/common';

import { Chunk } from './bytecode/chunk.mjs';
import { Runtime } from './runtime.mjs';

import { Tree } from './ast/index.js';

`{% if matbas_build == 'debug' %}`;
import c from 'ansi-colors';
import { parseBoolEnv } from './env.mjs';
import { formatter } from './format.mjs';
`{% if show_chunk %}`;
import { disassemble } from './bytecode/disassembler.mjs';
`{% endif %}`;
`{% if trace_runtime %}`;
import { disassembleInstruction } from './bytecode/disassembler.mjs';
`{% endif %}`;
`{% endif %}`;

let NO_TRACE = true;

//
// Active tracers.
//
const TRACERS: Record<string, Tracer> = {};

/**
 * A tracer.
 */
export interface Tracer {
  /**
   * Open a new span.
   *
   * @param name The name of the span.
   */
  open(name: string): void;

  /**
   * Close the current span.
   *
   * @param name The name of the span.
   */
  close(): void;

  /**
   * Log a trace.
   *
   * @param message The message to log.
   * @param ...args Additional arguments passed to `console.log`.
   */
  trace(message: any, ...args: any[]): void;

  /**
   * Run an async function inside a new span.
   *
   * @param name The name of the span.
   * @param fn An async function to run inside the span.
   * @returns The return value of the async function.
   */
  span<T>(name: string, fn: () => Promise<T>): Promise<T>;

  /**
   * Run a sync function inside a new span.
   *
   * @param name The name of the span.
   * @param fn A function to run inside the span.
   * @returns The return value of the function.
   */
  spanSync<T>(name: string, fn: () => T): T;

  child(name: string): Tracer;

  /**
   * Destroy the tracer. If getTracer is called again for the same tracer,
   * it will now be a fresh tracer.
   */
  destroy(): void;
}

/**
 * A no-op tracer. Used when tracing is disabled.
 */
export class NoopTracer implements Tracer {
  open(_name: string): void {}

  close(): void {}

  trace(_message: any, ..._args: any[]): void {}

  async span<T>(_name: string, fn: () => Promise<T>): Promise<T> {
    return fn();
  }

  spanSync<T>(_name: string, fn: () => T): T {
    return fn();
  }

  child(_name: string): Tracer {
    return this;
  }

  destroy(): void {}
}

const NOOP_TRACER = new NoopTracer();

/**
 * Get a child tracer. Call this to trace async execution outside the main
 * coroutine.
 *
 * @param name The name of the child tracer.
 */
let getTracer = function getTracer(
  _name: string,
  _active: boolean = true,
): Tracer {
  return NOOP_TRACER;
};

/**
 * Show a parse tree.
 *
 * @param tree The tree to show.
 */
let showTree = function showTree(_tree: Tree): void {
  return;
};

/**
 * Show a compiled chunk.
 *
 * @param chunk The chunk to show.
 */
let showChunk = function showChunk(_chunk: Chunk): void {
  return;
};

/**
 * Log the start of execution tracing.
 */
let startTraceExec = function startTraceExec(): void {};

/**
 * Trace a step in execution.
 * @param rt The runtime.
 */
let traceExec = function traceExec(_rt: Runtime): void {};

`{% if matbas_build == 'debug' %}`;

NO_TRACE = parseBoolEnv(process.env.NO_TRACE);

function encodingLocation(): string {
  try {
    throw new Error();
  } catch (err) {
    const line = err.stack.split('\n')[5];
    if (!line) {
      return '<unknown>';
    }
    return line.match(/\(([^)]+)\)/)[1];
  }
}

const SPAN_COLORS = ['yellow', 'green', 'cyan', 'blue', 'magenta', 'red'];

function spanColor(i: number, text: string): string {
  const method = SPAN_COLORS[i % SPAN_COLORS.length];
  return c[method](text);
}

let padBy = 22;

/**
 * A debug tracer. Used in development builds only.
 */
export class DebugTracer implements Tracer {
  private _spans: number = 0;

  get spans(): number {
    return this._spans;
  }

  set spans(value: number) {
    this._spans = value;
  }

  constructor(private name: string) {
    padBy = Math.max(
      padBy,
      ` <${c.cyan(this.name)}> `.padEnd(padBy, ' ').length,
    );
  }

  open(name: string): void {
    this.trace(name);
    this.spans++;
  }

  close(): void {
    this.spans--;
  }

  async span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.open(name);

    let rv: T;
    try {
      rv = await fn();
    } finally {
      this.close();
    }

    return rv;
  }

  spanSync<T>(name: string, fn: () => T): T {
    this.open(name);

    let rv: T;
    try {
      rv = fn();
    } finally {
      this.close();
    }

    return rv;
  }

  _log(...args: any[]): void {
    console.log(...args);
  }

  trace(message: any, ...args: any[]): void {
    const loc = encodingLocation();
    let prefix =
      c.green('TRACE') + ` <${c.cyan(this.name)}> `.padEnd(padBy, ' ');
    let multiLinePrefix: string;
    if (this.spans) {
      for (let i = 0; i < this.spans - 1; i++) {
        prefix += spanColor(i, '| ');
      }
      multiLinePrefix = prefix + spanColor(this.spans - 1, '|  ');
      prefix += spanColor(this.spans - 1, '|- ');
    } else {
      multiLinePrefix = prefix;
    }

    let msg: string[];
    if (typeof message === 'string') {
      msg = message.split('\n');
    } else {
      msg = formatter.format(message).split('\n');
    }

    for (const arg of args) {
      const formatted = formatter.format(arg);
      const sp = formatted.split('\n');
      if (sp.length) {
        msg[msg.length - 1] += ' ' + sp.shift();
        msg = msg.concat(sp);
      }
    }
    this._log(prefix + msg.shift() + c.gray(` at ${loc}`));
    for (const row of msg) {
      this._log(multiLinePrefix + row + c.gray(` at ${loc}`));
    }
  }

  child(name: string): Tracer {
    return new ChildDebugTracer(this, name);
  }

  destroy(): void {
    if (TRACERS[this.name] && this.name !== 'main') {
      delete TRACERS[this.name];
    }
  }
}

export class ChildDebugTracer extends DebugTracer {
  constructor(
    private parent: DebugTracer,
    name: string,
  ) {
    super(name);
  }

  get spans(): number {
    return this.parent.spans + 1;
  }

  set spans(value: number) {
    this.parent.spans = value - 1;
  }
}

getTracer = function getTracer(name: string): Tracer {
  if (NO_TRACE) {
    return NOOP_TRACER;
  }

  return TRACERS[name];
};

const mainTracer = new DebugTracer('main');

`{% if trace %}`;
TRACERS['main'] = mainTracer;
`{% else %}`;
TRACERS['main'] = NOOP_TRACER;
`{% endif %}`;

`{% if trace_parser %}`;
TRACERS['parser'] = mainTracer.child('parser');
`{% else %}`;
TRACERS['parser'] = NOOP_TRACER;
`{% endif %}`;

`{% if show_tree %}`;
if (!NO_TRACE) {
  showTree = function showTree(tree: Tree): void {
    console.log('=== Parse Tree: ===');
    console.log(formatter.format(tree));
  };
}
`{% endif %}`;

`{% if trace_compiler %}`;
TRACERS['compiler'] = mainTracer.child('compiler');
`{% else %}`;
TRACERS['compiler'] = NOOP_TRACER;
`{% endif %}`;

`{% if show_chunk %}`;
if (!NO_TRACE) {
  showChunk = function showChunk(chunk: Chunk): void {
    console.log(disassemble(chunk));
  };
}
`{% endif %}`;

`{% if trace_runtime %}`;
if (!NO_TRACE) {
  startTraceExec = function startTraceExec(): void {
    console.log('=== Execution Trace: ===');
  };

  traceExec = function traceExec(rt: Runtime): void {
    console.log('> stack:', formatter.format(rt.stack));
    console.log('>', disassembleInstruction(rt.chunk, rt.pc));
  };
}
`{% endif %}`;

`{% if trace_gc %}`;
TRACERS['gc'] = mainTracer.child('gc');
`{% else %}`;
TRACERS['gc'] = NOOP_TRACER;
`{% endif %}`;

`{% else %}`;
TRACERS['main'] = NOOP_TRACER;
TRACERS['parser'] = NOOP_TRACER;
TRACERS['compiler'] = NOOP_TRACER;
TRACERS['runtime'] = NOOP_TRACER;
TRACERS['gc'] = NOOP_TRACER;
`{% endif %}`;

@Injectable()
class NestLogger implements LoggerService {
  private tracer: Tracer;

  constructor() {
    this.tracer = getTracer('main');
  }

  log(message: any, ...optionalParams: any[]) {
    this.tracer.trace(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.tracer.trace(`FATAL: ${message}`, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.tracer.trace(`ERROR: ${message}`, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.tracer.trace(`WARN: ${message}`, ...optionalParams);
  }
}

export {
  getTracer,
  showTree,
  showChunk,
  startTraceExec,
  traceExec,
  NestLogger,
};
