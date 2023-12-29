import { Host } from './host';
import { CommandRunner } from './commander';
import { Editor } from './editor';

export interface TranslatorOptions {
  host: Host;
  commandRunner: CommandRunner;
  editor: Editor;
}

export class Translator {
  private readonly host: Host;
  private readonly commandRunner: CommandRunner;
  private readonly editor: Editor;

  constructor({ host, commandRunner, editor }: TranslatorOptions) {
    this.host = host;
    this.commandRunner = commandRunner;
    this.editor = editor;
  }

  async run(): Promise<void> {
  }
}
