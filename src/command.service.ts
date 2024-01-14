import { Inject, Injectable } from '@nestjs/common';
import { Host } from './host.service';
import { Editor } from './editor.service';
import { preRun, Runtime } from './runtime.service';

@Injectable()
export class CommandService {
  constructor(
    @Inject('Host') private readonly host: Host,
    private readonly editor: Editor,
    private readonly runtime: Runtime,
  ) {}
}
