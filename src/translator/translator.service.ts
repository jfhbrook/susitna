import { Inject, Injectable } from '@nestjs/common';
import { CommandService } from '../command/command.service';
import { Editor } from '../editor/editor.service';

@Injectable()
export class Translator {
  constructor(
    private readonly commandService: CommandService,
    private readonly editor: Editor,
  ) {}

  async run(): Promise<void> {}
}
