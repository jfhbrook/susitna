import t from 'tap';

import { render, RenderConfig } from '../src/templates';

const CONFIG: RenderConfig = {
  imports: ['import { Token } from "./token";'],
  types: [
    {
      name: 'Expr',
      fields: null,
      nodes: [
        {
          name: 'Assign',
          fields: [
            { name: 'name', type: 'Token' },
            { name: 'value', type: 'Expr | null' },
          ],
        },
      ],
    },
  ],
};

t.matchSnapshot(render(CONFIG), 'it renders a basic config');
