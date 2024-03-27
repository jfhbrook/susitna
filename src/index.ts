import { cli } from './cli';
import { Config } from './config';
import { Host } from './host';

export const main = cli(async function main(config: Config, host: Host) {
  host.writeInfo(config.toString());
});
