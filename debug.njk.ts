`{% if matbas_build == 'debug' %}`;
import { Tree } from './ast';
import { Chunk } from './bytecode/chunk';
import { parseBoolEnv } from './env';
import { formatter } from './format';
import { Runtime } from './runtime';
`{% if show_chunk or show_runtime %}`;
import { disassemble } from './bytecode/disassembler';
`{% endif %}`;
`{% if trace_runtime %}`;
import { disassembleInstruction } from './bytecode/disassembler';
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

/**
 * A debug tracer. Used in development builds only.
 */
export class DebugTracer implements Tracer {
  private spans: number = 0;

  constructor(private name: string) {}

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
    let prefix = `TRACE <${this.name}> `;
    if (this.spans) {
      for (let i = 0; i < this.spans - 1; i++) {
        prefix += '| ';
      }
      prefix += '|- ';
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
    for (const row of msg) {
      this._log(prefix + row);
    }
  }

  destroy(): void {
    if (TRACERS[this.name] && this.name !== 'main') {
      TRACERS[this.name] = undefined;
    }
  }
}

getTracer = function getTracer(name: string): Tracer {
  if (NO_TRACE) {
    return NOOP_TRACER;
  }

  return TRACERS[name];
};

`{% if trace %}`;
TRACERS['main'] = new DebugTracer('main');
`{% else %}`;
TRACERS['main'] = NOOP_TRACER;
`{% endif %}`;

`{% if trace_parser %}`;
TRACERS['parser'] = new DebugTracer('parser');
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
TRACERS['compiler'] = new DebugTracer('compiler');
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
TRACERS['gc'] = new DebugTracer('gc');
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

export { getTracer, showTree, showChunk, startTraceExec, traceExec };
