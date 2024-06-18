//
// Constants. These are configured by the build process.
//

export type BuildTypes = '{{ matbas_build }}' | 'debug' | 'release';

export const MATBAS_BUILD: BuildTypes = '{{ matbas_build }}';
export const MATBAS_VERSION = '{{ matbas_version }}';
export const TYPESCRIPT_VERSION = '{{ typescript_version }}';
export const NODE_VERSION = process.version.replace(/^v/, '');
