import { LoggerService } from '@nestjs/common';

import { pino, BaseLogger } from 'pino';

// A logger. For now, it uses Pino.
//
// This logger mostly exists because NestJS's container expects a logger.
// However, it may be useful for debug tracing of the interpreter's inner
// workings.
//
// All command IO should go through the Host object, not the Logger. However,
// the Host may use the Logger internally - I haven't decided yet.

// TODO: I need to implement the LoggerService API for NestJS, but it's not
// necessarily the API that I would want to use internally. If I want to use
// this logger elsewhere, I should inject it as a Logger and then call
// app.get/app.use to make NestJS use that logger internally.

// TODO: OpenTelemetry-style tracing support would be *extremely* useful.
// That's a big project, though. The easist way to support it may be to
// implement logging/tracing in rust with the tracing crate - yikes.

export class Logger implements LoggerService {
  private readonly logger: BaseLogger;

  constructor() {
    this.logger = pino({
      // TODO: Trace should not be the default log level - this should be
      // enabled by a flag.
      level: 'trace',
      transport: {
        // TODO: Pino is supposed to be used as a JSON logger. Pretty logs
        // are convenient to me *now*, but going towards JSON may be
        // preferred.
        target: 'pino-pretty',
      },
    });
  }

  // NestJS uses "log" internally, so we use this as the "trace" log level.
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

  // These two methods are optional for NestJS's LoggerService. Go figure.

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  // TODO: I feel OK about treating "log" as the internal NestJS hook, but
  // this info/verbose mismatch makes me wonder if I should define custom
  // log levels. Let's see what shakes out when I implement Host logging.
  verbose(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }
}
