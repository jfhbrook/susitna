import { Module } from '@nestjs/common';

import { ErrorModule } from '../error/error.module';

import { PreRun } from './pre-run.service';

// Validates the program and finalizes the bytecode prior to running. The
// editor can do a lot of syntax error checking during edit time, but anything
// involving context happens here:
//
// - ensuring loops and conditionals are nested properly
// - resolving context-dependent fields, such as index locations for GOTOs

@Module({
  imports: [ErrorModule],
  providers: [PreRun],
  exports: [PreRun],
})
export class PreRunModule {}
