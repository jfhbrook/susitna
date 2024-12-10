const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer();

async function main() {
  const span = tracer.startSpan('outer');
  try {
    await tracer.startActiveSpan('inner', async (_) => {
      console.log('inside span');
    });
  } finally {
    span.end();
  }
}

main();
