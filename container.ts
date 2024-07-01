import { getTracer } from './debug';

import { Config } from './config';
import { Host } from './host';
import { Editor } from './editor';
import { Executor } from './executor';

const tracer = getTracer('main');

export interface Container<H extends Host> {
  config: Config;
  host: H;
  editor: Editor;
  executor: Executor;
}

export interface ExecutorDependencies {
  config: Config;
  editor: Editor;
  host: Host;
}

export type ExecutorFactory = ({
  config,
  editor,
  host,
}: ExecutorDependencies) => Executor;

export function container<H extends Host>(
  config: Config,
  host: H,
  executorFactory: ExecutorFactory = ({ config, editor, host }) =>
    new Executor(config, editor, host),
): Container<H> {
  return tracer.spanSync('container', () => {
    const editor = new Editor(host);
    const executor = executorFactory({ config, editor, host });

    return {
      config,
      host,
      editor,
      executor,
    };
  });
}
