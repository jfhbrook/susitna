import { Module } from '@nestjs/common';

import { Config } from './config';
import { ConsoleHost } from './host';
import { Editor } from './editor';
import { Executor } from './executor';

@Module({
  providers: [
    { provide: 'argv', useValue: process.argv.slice(2) },
    { provide: 'env', useValue: process.env },
    {
      provide: Config,
      useFactory: (argv: typeof process.argv, env: typeof process.env) => {
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
  ],
})
export class Container {}
