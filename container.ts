import { getTracer } from './debug';

import { Config } from './config';
import { Host } from './host';
import { Editor } from './editor';
import { Executor } from './executor';
import { Translator } from './translator';

const tracer = getTracer('main');

export interface Container<H extends Host> {
  config: Config;
  host: H;
  editor: Editor;
  executor: Executor;
  translator: Translator;
}

export function container<H extends Host>(
  config: Config,
  host: H,
): Container<H> {
  return tracer.spanSync('container', () => {
    const editor = new Editor();
    const executor = new Executor(config, editor, host);
    const translator = new Translator(config, executor, host);

    return {
      config,
      host,
      editor,
      executor,
      translator,
    };
  });
}
