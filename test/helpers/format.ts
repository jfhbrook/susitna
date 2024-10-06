import process from 'node:process';

export function scrubNodeVersion(snap: string): string {
  return snap.replace(`Node.js: ${process.version}`, 'Node.js: NODE_VERSION');
}
