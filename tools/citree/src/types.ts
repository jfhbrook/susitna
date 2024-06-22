import { resolvePath } from './paths';

import { NodeDefinition, Spec } from './ast';

type TypeName = string;
type Path = string;

export interface Node {
  name: string;
  fields: string;
}

export interface Type {
  name: string;
  path: string;
  fields: string | null;
  nodes: Node[];
}

export type TypeDefs = Record<TypeName, Type>;
export type Types = Record<Path, TypeDefs>;

/**
 * Resolve node definitions into nodes.
 *
 * @param nodes: Parsed node definitions.
 * @returns Resolved nodes.
 */
export function resolveNodes(typeName: string, nodes: NodeDefinition[]): [string | null, Node[]] {
  let resolved: Node[] = [];
  let commonFields: string | null = null;
  for (let node of nodes) {
    if (node.name === typeName) {
      commonFields = node.fields;
    } else {
      resolved.push({
        name: node.name,
        fields: node.fields
      });
    }
  }

  return [commonFields, resolved];
}

export function resolveTypes(filename: string, spec: Spec): Types {
  const ts: Types = {};

  for (const t of spec.types) {
    // for each type definition
    const p = resolvePath(filename, t.path);
    if (!ts[p]) {
      ts[p] = {};
    }

    const [fields, nodes] = resolveNodes(t.name, t.nodes);
    ts[p][t.name] = {
      name: t.name,
      path: p,
      fields,
      nodes,
    };
  }

  return ts;
}
