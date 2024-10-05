export function merge(...lists) {
  return Array.from(
    lists.reduce((acc, exc) => acc.union(new Set(exc)), new Set()),
  ).sort();
}
