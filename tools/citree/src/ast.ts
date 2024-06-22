export type ImportStatement = {
  type: 'import';
  statement: string;
  path: string;
};

export type FieldDefinition = {
  name: string;
  type: string;
};

export type NodeDefinition = {
  type: 'node';
  name: string;
  fields: FieldDefinition[];
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
