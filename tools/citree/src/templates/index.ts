import { join } from 'path';

import * as nunjucks from 'nunjucks';

import { Imports } from '../imports';
import { Types } from '../types';

nunjucks.configure({ autoescape: false });

export interface NodeConfig {
  name: string;
  fields: string;
}

export interface TypeConfig {
  name: string;
  nodes: NodeConfig[];
}

export interface RenderConfig {
  imports: string[];
  types: TypeConfig[];
}

export function render(config: RenderConfig): string {
  return nunjucks.render(join(__dirname, 'main.ts.njk'), config);
}

type Path = string;

export type RenderedFiles = Record<Path, string>;

export function renderAll(imports: Imports, types: Types): RenderedFiles {
  return Object.fromEntries(
    Object.entries(types).map(([path, ts]) => [
      path,
      render({
        imports: imports[path] || [],
        types: Object.entries(ts).map(([_, t]): TypeConfig => t),
      }),
    ]),
  );
}
