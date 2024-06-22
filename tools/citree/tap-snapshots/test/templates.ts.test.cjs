/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/templates.ts > TAP > it renders a basic config 1`] = `

import { Token } from "./token";

export interface ExprVisitor<R> {
  visitAssignExpr(node: Assign): R;

}

export abstract class Expr {
  
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class Assign extends Expr {
  constructor(
    public name: Token,
    public value: Expr | null = null,
  ) {
    super(
    );
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}


`
