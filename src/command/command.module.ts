import { Module } from '@nestjs/common';

import { HostModule } from '../host/host.module';
import { EditorModule } from '../editor/editor.module';
import { RecreatorModule } from '../recreator/recreator.module';
import { PreRunModule } from '../pre-run/pre-run.module';
import { RuntimeModule } from '../runtime/runtime.module';

import { CommandService } from './command.service';

// Commander is in charge of running non-runtime commands. This includes:
//
// - RUN, which calls preRun and kicks off the runtime
// - LIST, which calls the recreator and passes the results to the Host
//   directly

@Module({
  imports: [
    HostModule,
    EditorModule,
    // TODO: Should commander call recreate? My guess is yes, since it will
    // be particular commands that recreate code.
    RecreatorModule,
    PreRunModule,
    RuntimeModule,
  ],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}
