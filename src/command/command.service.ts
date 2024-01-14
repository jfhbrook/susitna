import { Inject, Injectable } from '@nestjs/common';
import { Host } from '../host/host.service';
import { Editor } from '../editor/editor.service';
import { preRun, Runtime } from '../runtime/runtime.service';

@Injectable()
export class CommandService {
  constructor(
    @Inject('Host') private readonly host: Host,
    private readonly editor: Editor,
    private readonly runtime: Runtime,
  ) {}
}
