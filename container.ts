import { getTracer } from './debug';

import { Config } from './config';
import { Host } from './host';
import { Editor } from './editor';
import { Commander } from './commander';
import { Translator } from './translator';

const tracer = getTracer('main');

export interface Container<H extends Host> {
  config: Config;
  host: H;
  editor: Editor;
  commander: Commander;
  translator: Translator;
}

export function container<H extends Host>(
  config: Config,
  host: H,
): Container<H> {
  return tracer.spanSync('container', () => {
    const editor = new Editor();
    const commander = new Commander(config, editor, host);
    const translator = new Translator(config, commander, host);

    return {
      config,
      host,
      editor,
      commander,
      translator,
    };
  });
}
