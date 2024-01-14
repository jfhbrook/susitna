import { Module } from '@nestjs/common';

import { HostModule } from '../host/host.module';
import { ErrorModule } from '../error/error.module';
import { InterruptsModule } from '../interrupts/interrupts.module';

import { Runtime } from './runtime.service';

// Runtime runs programs. This is where the program counter lives. Unlike
// the commander, it can handle looping.

@Module({
  imports: [HostModule, InterruptsModule, ErrorModule],
  providers: [Runtime],
  exports: [Runtime],
})
export class RuntimeModule {}
