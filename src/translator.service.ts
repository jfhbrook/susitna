import { Inject, Injectable } from '@nestjs/common';
import { Host } from './host.service';
import { CommandService } from './command.service';
import { Editor } from './editor.service';

@Injectable()
export class Translator {
  constructor(
    @Inject('Host') private readonly host: Host,
    private readonly commandService: CommandService,
    private readonly editor: Editor,
  ) {}

  async run(): Promise<void> {}
}
