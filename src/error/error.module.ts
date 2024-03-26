import { Module } from '@nestjs/common';

import { ErrorService } from './error.service';

// Multiple components can generate errors. This is a central component
// to handle those errors.

@Module({
  imports: [
    // HostModule
  ],
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}
