import pino from 'pino';
import pretty from 'pino-pretty';

export const logger = new Proxy(
  {
    logger: pino(),
  },
  {
    get(target, prop, _receiver) {
      switch (prop) {
        case 'configure':
          return (options = {}) => {
            if (options.pretty) {
              target.logger = pino(pretty({ colorize: true }));
            } else {
              target.logger = pino();
            }
          };
        default:
          return Reflect.get(target.logger, prop);
      }
    },
  },
);
