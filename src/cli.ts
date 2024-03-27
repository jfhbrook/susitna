import { Config } from './config';
import { Exit } from './exit';
import { UsageFault } from './faults';
import { ConsoleHost, Host } from './host';

export interface Cli {
  argv: typeof process.argv;
  env: typeof process.env;
  defaultHost?: Host;
  main(config: Config, host: Host): Promise<void>;
}

export function cli(cli: Cli): () => Promise<void> {
  return async function main(): Promise<void> {
    const host: Host = new ConsoleHost();

    try {
      const config = Config.load(cli.argv, cli.env);
      host.setLevel(config.logLevel);
      // NOTE: It is up to the main function to initialize and close the
      // host.
      await cli.main(config, host);
    } catch (err) {
      // CLI usage faults are appropriate to log onto the console.
      if (err instanceof UsageFault) {
        console.log(err.message);
        process.exit(err.exitCode);
      }

      // Handle successful exits.
      if (err instanceof Exit) {
        if (err.message) {
          host.writeInfo(err.message);
        }
        process.exit(err.exitCode);
      }

      if (typeof err.exitCode === 'number') {
        host.writeError(err);
        process.exit(err.exitCode);
      }

      // TODO: Handle other Faults and Errors
      throw err;
    }
  };
}
