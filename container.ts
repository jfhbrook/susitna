import { Module } from '@nestjs/common';

import { Config, Argv, Env } from './config';
import { Main } from './cli';
import { ConsoleHost } from './host';
import { Editor } from './editor';
import { Executor } from './executor';

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
    Main,
  ],
})
export class Container {}
