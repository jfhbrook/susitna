import { NodeSDK } from '@opentelemetry/sdk-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

//#if _MATBAS_BUILD == 'debug'
import VERSIONS from 'consts:versions';
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
  // ConsoleSpanExporter,
  AlwaysOnSampler,
} from '@opentelemetry/sdk-trace-node';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import { parseBoolEnv } from './env';
//#endif

let NO_TRACE = true;

//#if _MATBAS_BUILD == 'debug'
NO_TRACE = parseBoolEnv(process.env.NO_TRACE);
//#endif

let options = {};

//#if _MATBAS_BUILD == 'debug'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

export const contextManager = new AsyncHooksContextManager();

const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'matbas',
  [ATTR_SERVICE_VERSION]: VERSIONS.matbas,
});

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4317',
});
/*
const traceExporter = new ConsoleSpanExporter();
*/

const spanProcessor = new SimpleSpanProcessor(traceExporter);

const debugSpanProcessor = {
  forceFlush: async () => {},
  onStart: (_span: any, _parentContext: any) => {},
  onEnd: (span: any) => {
    console.log(span);
  },
  shutdown: async () => {},
};

const tracerProvider = new NodeTracerProvider({
  resource,
  forceFlushTimeoutMillis: 0,
  spanProcessors: [spanProcessor, debugSpanProcessor],
  sampler: new AlwaysOnSampler(),
});

if (!NO_TRACE) {
  options = {
    resource,
    spanProcessors: [spanProcessor, debugSpanProcessor],
    tracerProvider,
    traceExporter,
    contextManager,
    instrumentations: [getNodeAutoInstrumentations()],
  };
}
//#endif

export const sdk = new NodeSDK(options);

export function startTelemetry() {
  //#if _MATBAS_BUILD == 'debug'
  return sdk.start();
  //#endif
}

export async function stopTelemetry() {
  await sdk.shutdown();
}
