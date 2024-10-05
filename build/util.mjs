export function exclude(...excludes) {
  return excludes.reduce((acc, exc) => acc.concat(exc), []).sort();
}
