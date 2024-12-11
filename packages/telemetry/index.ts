import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';

// TODO: These instrumentations are too noisy for me right now, but there
// might be a scenario where they're useful.
/*
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns';
import { FsInstrumentation } from '@opentelemetry/instrumentation-fs';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { NetInstrumentation } from '@opentelemetry/instrumentation-net';
*/

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'matbas',
    [ATTR_SERVICE_VERSION]: process.env.MATBAS_VERSION,
  }),
  contextManager: new AsyncLocalStorageContextManager(),
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4317',
  }),
  instrumentations: [],
});

sdk.start();

process.on('exit', async () => {
  await sdk.shutdown();
});
