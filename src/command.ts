import { Host } from './host';
import { Editor } from './editor';
import { preRun, Runtime } from './runtime';

export interface CommandRunnerOptions {
  host: Host;
  editor: Editor;
  runtime: Runtime;
}

export class CommandRunner {
  private readonly host: Host;
  private readonly editor: Editor;
  private runtime: Runtime;

  constructor({ host, editor, runtime }: CommandRunnerOptions) {
    this.host = host;
    this.editor = editor;
    this.runtime = runtime;
  }
}
