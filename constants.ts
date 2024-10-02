//
// Constants. These are configured by the build process.
//

export type BuildTypes = 'debug' | 'debug' | 'release';

export const MATBAS_BUILD: BuildTypes = 'debug';
export const MATBAS_VERSION = '0.0.1';
export const TYPESCRIPT_VERSION = '5.5.2';
export const NODE_VERSION = process.version.replace(/^v/, '');
