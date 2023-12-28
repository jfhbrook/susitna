import { Host } from './host';
import { Debugger } from './debug';
import { Editor } from './editor';
import { preRun, Runtime } from './runtime';

export interface CommanderOptions {
  host: Host;
  debug: Debugger;
  editor: Editor;
  runtime: Runtime;
}

export class Commander {
  private readonly host: Host;
  private readonly debug: Debugger;
  private readonly editor: Editor;
  private runtime: Runtime;

  constructor({ host, debug, editor, runtime }: CommanderOptions) {
    this.host = host;
    this.debug = debug;
    this.editor = editor;
    this.runtime = runtime;
  }
}
