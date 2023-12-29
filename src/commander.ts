import { Host } from './host';
import { Editor } from './editor';
import { preRun, Runtime } from './runtime';

export interface CommanderOptions {
  host: Host;
  editor: Editor;
  runtime: Runtime;
}

export class Commander {
  private readonly host: Host;
  private readonly editor: Editor;
  private runtime: Runtime;

  constructor({ host, editor, runtime }: CommanderOptions) {
    this.host = host;
    this.editor = editor;
    this.runtime = runtime;
  }
}
