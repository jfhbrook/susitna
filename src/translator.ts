import { Host } from './host';
import { Commander } from './commander';
import { Editor } from './editor';

export interface TranslatorOptions {
  host: Host;
  commander: Commander;
  editor: Editor;
}

export class Translator {
  private readonly host: Host;
  private readonly commander: Commander;
  private readonly editor: Editor;

  constructor({ host, commander, editor }: TranslatorOptions) {
    this.host = host;
    this.commander = commander;
    this.editor = editor;
  }

  async run(): Promise<void> {
  }
}
