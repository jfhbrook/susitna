import { globSync } from 'glob';

export function merge(...lists) {
  return Array.from(
    new Set(lists.reduce((acc, exc) => acc.concat(exc), [])),
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
