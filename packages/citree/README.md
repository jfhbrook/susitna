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

The best way to see how `citree` works is to look at the
[example](./example/ast.citree):

### Creating a Specification

First, make an `ast.citree` file. That would look something like this:

```
type Expr in './expr' {
  import { Token, TokenKind } from '../tokens'

  Unary          => op: TokenKind, expr: Expr
  Binary         => left: Expr, op: TokenKind, right: Expr
  Logical        => left: Expr, op: TokenKind, right: Expr
  Group          => expr: Expr
  Variable       => ident: Token
  IntLiteral     => value: number
  RealLiteral    => value: number
  BoolLiteral    => value: boolean
  StringLiteral  => value: string
  PromptLiteral  => value: string
  NilLiteral!
}

type Instr in './instr' {
  import { Expr, Variable } from './expr'

  Instr      => offsetStart: number = -1, offsetEnd: number = -1
  Rem        => remark: string
  Let        => variable: Variable, value: Expr | null
  Assign     => variable: Variable, value: Expr
  Expression => expression: Expr
  Print      => expression: Expr
  Exit       => expression: Expr | null
  End!
  New        => filename: Expr | null
  Load       => filename: Expr, run: boolean
  List!
  Renum!
  Run!
  Save       => filename: Expr | null
  ShortIf    => condition: Expr, then: Instr[], else_: Instr[]
  If         => condition: Expr
  Else!
  ElseIf     => condition: Expr
  EndIf!
}

type Tree in './index' {
  import { Source } from './source'
  import { Instr } from './instr'

  Cmd          => cmdNo: number, row: number, source: Source, instructions: Instr[]
  Line         => lineNo: number, row: number, source: Source, instructions: Instr[]
  Input        => input: Array<Cmd | Line>
  Program      => filename: string, lines: Line[]
}

```

### Running `citree`

Then, run `citree` against that file:

```sh
npx @jfhbrook/citree -- ast.citree
```

This will generate two files, `expr.ts` and `stmt.ts`. Each of these files
will contain a class, a visitor interface, and a series of subclasses
corresponding to the specified types. It will also contain classes
corresponding to each type.

For example, `expr.ts` will look like this:

```typescript
import { Token, TokenKind } from '../tokens';

export interface ExprVisitor<R> {
  visitUnaryExpr(node: Unary): R;
  visitBinaryExpr(node: Binary): R;
  visitLogicalExpr(node: Logical): R;
  visitGroupExpr(node: Group): R;
  visitVariableExpr(node: Variable): R;
  visitIntLiteralExpr(node: IntLiteral): R;
  visitRealLiteralExpr(node: RealLiteral): R;
  visitBoolLiteralExpr(node: BoolLiteral): R;
  visitStringLiteralExpr(node: StringLiteral): R;
  visitPromptLiteralExpr(node: PromptLiteral): R;
  visitNilLiteralExpr(node: NilLiteral): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class Unary extends Expr {
  constructor(
    public op: TokenKind,
    public expr: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Binary extends Expr {
  constructor(
    public left: Expr,
    public op: TokenKind,
    public right: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Logical extends Expr {
  constructor(
    public left: Expr,
    public op: TokenKind,
    public right: Expr,
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }
}

export class Group extends Expr {
  constructor(public expr: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGroupExpr(this);
  }
}

export class Variable extends Expr {
  constructor(public ident: Token) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}

export class IntLiteral extends Expr {
  constructor(public value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitIntLiteralExpr(this);
  }
}

export class RealLiteral extends Expr {
  constructor(public value: number) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitRealLiteralExpr(this);
  }
}

export class BoolLiteral extends Expr {
  constructor(public value: boolean) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBoolLiteralExpr(this);
  }
}

export class StringLiteral extends Expr {
  constructor(public value: string) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitStringLiteralExpr(this);
  }
}

export class PromptLiteral extends Expr {
  constructor(public value: string) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitPromptLiteralExpr(this);
  }
}

export class NilLiteral extends Expr {
  constructor() {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitNilLiteralExpr(this);
  }
}

```

### Using the Generated Files

For a complete example of using the generated files, check out
[Matanuska BASIC](https://github.com/jfhbrook/matanuska), which uses `citree`
to generate its AST.

## Testing

You can run current tests with npm:

```sh
npm test
```

This includes an end-to-end test with the example.

## License

This project is MIT licensed. For more, see [./LICENSE](./LICENSE).
