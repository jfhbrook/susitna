import { resolvePath } from './paths';
import { Spec } from './ast';

type ImportStatement = string;
type Path = string;

export type Imports = Record<Path, ImportStatement[]>;

// TODO: paths are more or less hard-coded right now. It would be cool to
// adjust the global paths based on where the files are being written.
export function resolveImports(
  filename: string,
  spec: Spec,
  ext: string,
): Imports {
  const imps: Imports = {};

  for (const t of spec.types) {
    const p = resolvePath(filename, t.path, ext);
    imps[p] = spec.imports
      .map((i) => i.statement)
      .concat(t.imports.map((i) => i.statement));
  }

  return imps;
}
