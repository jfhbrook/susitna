import { Inject, Injectable } from '@nestjs/common';
import { Host } from '../host/host.service';
import { CommandService } from '../command/command.service';
import { Editor } from '../editor/editor.service';

@Injectable()
export class Translator {
  constructor(
    @Inject('Host') private readonly host: Host,
    private readonly commandService: CommandService,
    private readonly editor: Editor,
  ) {}

  async run(): Promise<void> {}
}
