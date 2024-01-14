import { Module } from '@nestjs/common';

import { ConsoleHost } from './host.service';

// host is an abstract interface for all I/O. This includes:
//
// - prompting
// - logging
// - stdio
// - file i/o
// - processes, PIDs, waiting, etc
// - serial
// - sockets
// - i/o events, such as CTRL-C and CTRL-D
// - drawing, curses
//
// This component is the one which is expected to differ based on the
// environment - console, graphical, and so on.
//
// Notable, it does NOT include formatting internal representations.

@Module({
  imports: [],
  providers: [
    {
      provide: 'Host',
      useClass: ConsoleHost,
    },
  ],
  exports: ['Host'],
})
export class HostModule {}
