import { Module } from '@nestjs/common';

import { ErrorModule } from '../error/error.module';
import { InterruptModule } from '../interrupt/interrupt.module';

import { Runtime } from './runtime.service';

// Runtime runs programs. This is where the program counter lives. Unlike
// the commander, it can handle looping.

@Module({
  imports: [
    // HostModule,
    InterruptModule,
    ErrorModule,
  ],
  providers: [Runtime],
  exports: [Runtime],
})
export class RuntimeModule {}
