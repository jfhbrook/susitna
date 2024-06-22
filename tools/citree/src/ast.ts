export type ImportStatement = {
  type: 'import';
  statement: string;
  path: string;
};

export type NodeDefinition = {
  type: 'node';
  name: string;
  fields: string;
};

export type TypeDefinition = {
  type: 'type';
  name: string;
  path: string | null;
  imports: ImportStatement[];
  nodes: NodeDefinition[];
};

export type Spec = {
  imports: ImportStatement[];
  types: TypeDefinition[];
};
