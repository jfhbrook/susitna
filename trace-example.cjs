const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('main');

async function main() {
  await tracer.startActiveSpan('span', async (_) => {
    console.log('inside span');
  });
}

main();
