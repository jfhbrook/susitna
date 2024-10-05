import { merge } from './util.mjs';

import config from './config.mjs';

export const prettierIgnore = merge(config.exclude, config.format.exclude);
export const prettierRc = Object.fromEntries(
  Object.entries(config.format).filter(([k, _v]) => k !== 'exclude'),
);
