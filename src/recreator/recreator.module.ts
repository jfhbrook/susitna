import { Module } from '@nestjs/common';

import { Recreator } from './recreator.service';

// Takes internal code and re-creates formatted source code from it.

@Module({
  imports: [],
  providers: [Recreator],
  exports: [Recreator],
})
export class RecreatorModule {}
