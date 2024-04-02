# citree

`citree` is a DSL for generating TypeScript AST files. It's inspired by the
[Java AST generator](https://craftinginterpreters.com/representing-code.html#metaprogramming-the-trees)
in [Crafting Interpreters](https://craftinginterpreters.com/index.html) by
Robert Nystrom.

## Install

You can install `citree` into your project with npm:

```sh
npm i --save-dev @jfhbrook/citree
```

## Usage

### Creating a Specification

**TODO:** Use an example driven by a real example - either making `tslox`
use `citree`, or using an example based on `matanuska`.

First, make an `ast.citree` file. That would look something like this:

```
// Import Token for all generated files
import { Token } from './token'

// Generate an Expr class and an ExprVisitor interface in ./expr.ts
type Expr in './expr' {
  // Only import Value in ./expr.ts
  import { Value } from './value'

  // Generate Expr subclasses containing these properties with corresponding
  // ExprVisitor methods
  Assign   => name: Token, value: Expr
  Binary   => left: Expr, operator: Token, right: Expr
  Call     => callee: Expr, paren: Token, args: Expr[]
  Grouping => expression: Expr
  Literal  => value: Value
  Logical  => left: Expr, operator: Token, right: Expr
  Unary    => operator: Token, right: Expr
  Variable => name: Token
}

// Generate a Stmt class and a StmtVisitor interface in ./stmt.ts
type Stmt in './stmt' {
  // Only import Expr in ./stmt.ts
  import { Expr } from './expr'

  // Generate Stmt subclasses containing these properties with corresponding
  // StmtVisitor methods
  Block      => statements: Stmt[]
  Expression => expression: Expr
  Function   => name: Token, params: Token[], body: Stmt[]
  If         => condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null
  Print      => expression: Expr
  Return     => keyword: Token, value: Expr | null
  Var        => name: Token, initializer: Expr | null
  While      => condition: Expr, body: Stmt
}
```

### Running `citree`

Then, run `citree` against that file:

```sh
npx @jfhbrook/citree -- ast.citree
```

This will generate two files, `expr.ts` and `stmt.ts`. Each of these files
will contain a class, a visitor interface, and a series of subclasses
corresponding to the specified types. For example, `expr.ts` will contain the
following imports, interface and root class:

```typescript
import { Token } from './token';
import { Value } from './value';

export interface ExprVisitor<R> {
  visitAssignExpr(node: Assign): R;
  visitBinaryExpr(node: Binary): R;
  visitCallExpr(node: Call): R;
  visitGroupingExpr(node: Grouping): R;
  visitLiteralExpr(node: Literal): R;
  visitLogicalExpr(node: Logical): R;
  visitUnaryExpr(node: Unary): R;
  visitVariableExpr(node: Variable): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}
```

It will also contain classes corresponding to each type. For example, here's
the definition for an `Assign` expression:

```typescript
class Assign extends Expr {
  constructor(
    public readonly name: Token,
    public readonly value: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}
```

### Using the Generated Files

**TODO:** Create an example of using the generated files.

## Testing

You can run current tests with npm:

```sh
npm test
```

**TODO:** End-to-end tests using some examples.

## License

This project is MIT licensed. For more, see [./LICENSE](./LICENSE).
