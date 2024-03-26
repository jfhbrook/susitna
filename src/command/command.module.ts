import { Module } from '@nestjs/common';

import { EditorModule } from '../editor/editor.module';
import { RecreatorModule } from '../recreator/recreator.module';
import { PreRunModule } from '../pre-run/pre-run.module';
import { RuntimeModule } from '../runtime/runtime.module';

import { CommandService } from './command.service';

// Command service is basically in charge of session management:
//
// - initializing/resetting sessions
//   - initting/resetting the Program
//   - initting the Host
//   - loading history
//   - running autoexec.bas
//   - printing any startup messages
// - decoding non-runtime commands (as opposed to statements)
//   - editor commands, for example
//   - NOTE: in some languages commands are prefixed - `.exit` in node.js
//     REPL is a command, for example
//   - can/should delegate to the runtime and/or other components as
//     appropriate, esp. if the commands are also valid statements
// - handling break-ins/halts/etc
//   - other components call in to get things in a sensible state
//   - NOTE: errors module would only handle *reporting* of errors, actual
//     error *recovery* happens in the Command service
// - cleaning up on exit
//   - gracefully shutting down running jobs (in bash parlance)
//   - getting the host to clear handles
//   - flushing history

@Module({
  imports: [
    // HostModule,
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
