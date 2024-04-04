//
// Constants.
//
// My intent is to use Rollup to create a release build, and use its "replace"
// plugin to modify these constants in the release build. This plus tree
// shaking should be able to cut out debug-only functionality, such as tracing.
//

export type BuildTypes = 'debug' | 'release';

export const MATBAS_BUILD: BuildTypes = 'debug';
