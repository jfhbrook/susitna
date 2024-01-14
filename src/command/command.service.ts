import { Inject, Injectable } from '@nestjs/common';
import { Host } from '../host/host.service';
import { Editor } from '../editor/editor.service';
import { Recreator } from '../recreator/recreator.service';
import { PreRun } from '../pre-run/pre-run.service';
import { Runtime } from '../runtime/runtime.service';

@Injectable()
export class CommandService {
  constructor(
    @Inject('Host') private readonly host: Host,
    private readonly editor: Editor,
    private readonly recreator: Recreator,
    private readonly preRun: PreRun,
    private readonly runtime: Runtime,
  ) {}
}
