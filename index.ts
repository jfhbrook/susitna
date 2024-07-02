import * as dotenv from 'dotenv';

import { MATBAS_BUILD } from './constants';

if (MATBAS_BUILD === 'debug') {
  dotenv.config();
}

import { NestFactory } from '@nestjs/core';

import { getTracer } from './debug';
import { Container } from './container';
import { Main } from './cli';

const tracer = getTracer('main');

export async function main(): Promise<void> {
  tracer.open('main');
  const deps = await NestFactory.createApplicationContext(Container);
  const main = deps.get(Main);
  try {
    await main.start();
  } finally {
    tracer.close();
  }
}
