export function shuffle<T>(xs: T[]) {
  let curr = xs.length;

  while (curr) {
    const rnd = Math.floor(Math.random() * curr);
    curr--;

    [xs[curr], xs[rnd]] = [xs[rnd], xs[curr]];
  }
}
