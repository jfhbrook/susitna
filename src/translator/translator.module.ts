import { Module } from '@nestjs/common';

import { EditorModule } from '../editor/editor.module';
import { CommandModule } from '../command/command.module';

import { Translator } from './translator.service';

// The translator is where the main REPL logic lives:
//
// - reads lines from the host
// - calls scanner and parser to generate IR
// - passes commands to the commander
// - passes edits to the editor
//
// It actually does not receive data from the commander or editor - that
// would go directly to the host.
//
// It also handles:
//
// - non-interactive sessions, which read from a file and then exit
// - dropping to debugging mode on a CTRL-D during runtime

@Module({
  imports: [
    // HostModule,
    EditorModule,
    CommandModule,
  ],
  providers: [Translator],
  exports: [Translator],
})
export class TranslatorModule {}
