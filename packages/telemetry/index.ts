import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns';
import { FsInstrumentation } from '@opentelemetry/instrumentation-fs';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { NetInstrumentation } from '@opentelemetry/instrumentation-net';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'matbas',
    [ATTR_SERVICE_VERSION]: process.env.MATBAS_VERSION,
  }),
  contextManager: new AsyncLocalStorageContextManager(),
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4317',
  }),
  instrumentations: [
    // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-dns
    new DnsInstrumentation({}),
    // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/instrumentation-fs
    new FsInstrumentation({}),
    // https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http
    new HttpInstrumentation({}),
    // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-nestjs-core
    new NestInstrumentation({}),
    new NetInstrumentation({}),
    // TODO: undici
    // https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/instrumentation-undici
  ],
});

sdk.start();

process.on('exit', async () => {
  await sdk.shutdown();
});
