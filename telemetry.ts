import { NodeSDK } from '@opentelemetry/sdk-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

//#if _MATBAS_BUILD == 'debug'
import { context } from '@opentelemetry/api';
import VERSIONS from 'consts:versions';
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
export const contextManager = new AsyncHooksContextManager();

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

if (!NO_TRACE) {
  options = {
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'matbas',
      [ATTR_SERVICE_VERSION]: VERSIONS.matbas,
    }),
    traceExporter: new OTLPTraceExporter({
      url: 'http://localhost:4317/v1/traces',
    }),
    contextManager,
    instrumentations: [getNodeAutoInstrumentations()],
  };
}
//#endif

export const sdk = new NodeSDK(options);

export function startTelemetry() {
  //#if _MATBAS_BUILD == 'debug'
  sdk.start();
  //#endif
}

export async function stopTelemetry() {
  await sdk.shutdown();
}
