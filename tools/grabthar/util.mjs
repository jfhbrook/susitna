import { createRequire } from 'node:module';

import { globSync } from 'glob';

const MySet = Set.union
  ? Set
  : createRequire(import.meta.url)('es6-set/polyfill');

export function merge(...lists) {
  return Array.from(
    lists.reduce((acc, exc) => acc.union(new MySet(exc)), new MySet()),
  ).sort();
}

export function parseBoolEnv(value) {
  if (!value) {
    return false;
  }

  if (value.match(/^\W*$/)) {
    return false;
  }

  if (value.match(/^\W*0\W*$/)) {
    return false;
  }

  if (value.match(/^\W*false\W*$/i)) {
    return false;
  }

  return true;
}

export function expandGlobs(...globs) {
  return globs.reduce((files, gl) => {
    return files.concat(globSync(gl));
  }, []);
}
