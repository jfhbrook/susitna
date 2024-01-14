import { LoggerService } from '@nestjs/common';

import { pino, BaseLogger } from 'pino';

// I don't really like the standard NestJS logger, so I'm rolling my own on
// top of pino.
//
// This introduces some challenges, since the API of the NestJS ConsoleLogger
// makes different assumptions than the standard Pino logger. Things they
// agree on:
//
// - The first argument may either be an object or a message.
//
// Things ConsoleLogger does that pino doesn't:
//
// - The last arg is typically treated as a "context" parameter
// - If exactly two arguments, the second *may* be treated as a serialized
//   stack
// - Messages may be arrays - these are serialized the same as objects.
// - Messages may also be functions or classes. Functions are called at the
//   time of logging; classes log their names.
//
// Things pino does that ConsoleLogger doesn't:
//
// - Objects as the first argument are mixed into the JSON output instead of
//   logged directly
// - Remaining arguments are treated as formatting parameters.
//
// For now, I'm going to naively log things with pino, but if Nest assumes
// things when logging internally, I may change my mind.

export class Logger implements LoggerService {
  private readonly logger: BaseLogger;

  constructor() {
    // TODO: Make this configurable on construction. We almost definitely
    // don't want tracing on by default!
    this.logger = pino({
      level: 'trace',
      transport: {
        target: 'pino-pretty',
      },
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.trace(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.logger.fatal(message, ...optionalParams);
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }
  verbose(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }
}
