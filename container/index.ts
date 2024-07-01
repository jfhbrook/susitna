import { Container } from 'inversify';

import { TYPES } from './types';

import { Config } from '../config';
import { Host, ConsoleHost, Level } from '../host';
import { Editor } from '../editor';
import { Executor } from '../executor';

const container = new Container();

container.bind<Host>(TYPES.Host).toConstantValue(new ConsoleHost());
container
  .bind<Config>(TYPES.Config)
  .toConstantValue(new Config(null, null, null, Level.Info, [], process.env));
container.bind<Editor>(TYPES.Editor).to(Editor);
container.bind<Executor>(TYPES.Executor).to(Executor);

export { container };
