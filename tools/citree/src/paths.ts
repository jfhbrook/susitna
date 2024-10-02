import { basename, dirname, extname, join, resolve } from 'path';

export function resolvePath(
  filename: string,
  path: string | null,
  defaultExt?: string,
) {
  let ext = extname(path || filename);
  if (!ext.length) {
    ext = defaultExt ? `.${defaultExt}` : '.ts';
  }

  return resolve(
    join(dirname(filename), `${basename(path || filename)}${ext}`),
  );
}
