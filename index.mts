import * as dotenv from 'dotenv';

import { MATBAS_BUILD } from './constants.mjs';

if (MATBAS_BUILD === 'debug') {
  dotenv.config();
}

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { NestLogger } from './debug.mjs';

import { Translator } from './translator.mjs';
import { Config, Argv, Env } from './config.mjs';
import { ConsoleHost } from './host.mjs';
import { Editor } from './editor.mjs';
import { Executor } from './executor.mjs';

@Module({
  providers: [
    { provide: 'argv', useValue: process.argv.slice(2) },
    { provide: 'env', useValue: process.env },
    { provide: 'exitFn', useValue: process.exit },
    {
      provide: Config,
      useFactory: (argv: Argv, env: Env) => {
        return Config.load(argv, env);
      },
      inject: ['argv', 'env'],
    },
    {
      provide: 'Host',
      useClass: ConsoleHost,
    },
    Editor,
    Executor,
    Translator,
  ],
})
export class Container {}

export async function main(): Promise<void> {
  const deps = await NestFactory.createApplicationContext(Container, {
    logger: new NestLogger(),
  });
  const translator = deps.get(Translator);
  await translator.start();
}
