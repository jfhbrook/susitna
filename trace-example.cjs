const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer();

async function main() {
  await tracer.startActiveSpan('span', async (_) => {
    console.log('inside span');
  });
}

main();
