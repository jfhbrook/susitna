import { NODE_VERSION } from '../../constants.mjs';

export function scrubNodeVersion(snap: string): string {
  return snap.replace(`Node.js: v${NODE_VERSION}`, 'Node.js: NODE_VERSION');
}
