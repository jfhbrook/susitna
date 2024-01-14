import { Module } from '@nestjs/common';

import { HostModule } from './host/host.module';
import { ErrorModule } from './error/error.module';
import { InterruptsModule } from './interrupts/interrupts.module';
import { RuntimeModule } from './runtime/runtime.module';
import { EditorModule } from './editor/editor.module';
import { CommandModule } from './command/command.module';
import { TranslatorModule } from './translator/translator.module';

@Module({
  imports: [
    TranslatorModule,
  ],
})
export class AppModule {}
