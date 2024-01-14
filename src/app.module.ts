import { Module } from '@nestjs/common';

import { TranslatorModule } from './translator/translator.module';

@Module({
  imports: [
    TranslatorModule,
  ],
})
export class AppModule {}
