import { Attributes, context, Context, Span, SpanOptions, trace } from '@opentelemetry/api';

import { Tree } from './ast';
import { Chunk } from './bytecode/chunk';
import { Runtime } from './runtime';

//#if _MATBAS_BUILD == 'debug'
import { parseBoolEnv } from './env';
import { formatter } from './format';
//#if _DEBUG_SHOW_CHUNK
import { disassemble } from './bytecode/disassembler';
//#endif
//#if _DEBUG_TRACE_RUNTIME
import { disassembleInstruction } from './bytecode/disassembler';
//#endif
//#endif

let NO_TRACE = true;

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

const tracer = trace.getTracer('main');

// Very similar to OpenTelemetry's implementation of startActiveSpan, except
// the callback function closes the span and attaches annotations in error
// cases.
//
// This is currently defined regardless of whether or not we're in debug
// mode, so that calling startSpan without a guard won't crash the program.
// In practice, guards are placed at the call site.
//
// See: https://github.com/open-telemetry/opentelemetry-js/blob/main/api/src/trace/NoopTracer.ts#L56-L100
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  fn: F
): ReturnType<F>;
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  opts: SpanOptions | undefined,
  fn: F
): ReturnType<F>;
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  opts: SpanOptions | undefined,
  ctx: Context | undefined,
  fn: F
): ReturnType<F>;
function startSpan<F extends (span: Span) => ReturnType<F>>(
  name: string,
  arg2?: F | SpanOptions,
  arg3?: F | Context,
  arg4?: F
): ReturnType<F> | undefined {
  let opts: SpanOptions | undefined;
  let ctx: Context | undefined;
  let fn: F;
  if (arguments.length < 2) {
    return;
  } else if (arguments.length === 2) {
    fn = arg2 as F;
  } else if (arguments.length === 3) {
    opts = arg2 as SpanOptions | undefined;
    fn = arg3 as F;
  } else {
    opts = arg2 as SpanOptions | undefined;
    ctx = arg3 as Context | undefined;
    fn = arg4 as F;
  }
  const wrapped = (span: Span) => {
    try {
      return fn(span);
    } catch (err) {
      span.recordException(err);
  throw err;
    } finally {
      span.end();
    }
  }

  const parentContext = ctx ?? context.active();
  const span = tracer.startSpan(name, opts, parentContext);
  const contextWithSpanSet = trace.setSpan(parentContext, span);
  return context.with(contextWithSpanSet, wrapped, undefined, span);
}

// A convenience function for adding events when you don't have the span
// immediately on-hand. Like startSpan, this is not hidden behind jscc and
// should instead be conditionally imported/called at the site of use.
function addEvent(message: string, attributes: Attributes = {}): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(message, attributes);
  }
}

//#if _MATBAS_BUILD == 'debug'
NO_TRACE = parseBoolEnv(process.env.NO_TRACE);

//#if _DEBUG_SHOW_TREE
if (!NO_TRACE) {
  showTree = function showTree(tree: Tree): void {
    console.log('=== Parse Tree: ===');
    console.log(formatter.format(tree));
  };
}
//#endif

//#if _DEBUG_SHOW_CHUNK
if (!NO_TRACE) {
  showChunk = function showChunk(chunk: Chunk): void {
    console.log(disassemble(chunk));
  };
}
//#endif

//#if _DEBUG_TRACE_RUNTIME
if (!NO_TRACE) {
  startTraceExec = function startTraceExec(): void {
    console.log('=== Execution Trace: ===');
  };

  traceExec = function traceExec(rt: Runtime): void {
    console.log('> stack:', formatter.format(rt.stack));
    console.log('>', disassembleInstruction(rt.chunk, rt.pc));
  };
}
//#endif
//#endif

export {
  showTree,
  showChunk,
  startTraceExec,
  traceExec,
  startSpan,
  addEvent,
};
