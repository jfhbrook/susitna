import { trace, spanSync } from './trace';

import { NotImplementedError } from './exceptions';
import { Host } from './host';
import { Stack } from './stack';
import { TokenKind } from './tokens';
import { Value, nil } from './value';

const BINARY_OP = {
  [TokenKind.Plus]: 'add',
  [TokenKind.Minus]: 'sub',
  [TokenKind.Star]: 'mul',
  [TokenKind.Slash]: 'div',
};

const LOGICAL_OP = {};

const UNARY_OP = {
  [TokenKind.Minus]: 'neg',
};

import { TreeVisitor, CommandGroup, Line, Input, Program } from './ast';
import { CmdVisitor, Expression, Print } from './ast/cmd';
import {
  ExprVisitor,
  Binary,
  Logical,
  Unary,
  Group,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  PromptLiteral,
  NilLiteral,
} from './ast/expr';

export class Runtime
  implements TreeVisitor<Value>, CmdVisitor<Value>, ExprVisitor<Value>
{
  public stack: Stack;
  private lineNo: number = 0;
  private isLine: boolean = false;

  constructor(private host: Host) {
    this.stack = new Stack();
  }

  run(tree: Input | Program): Value {
    return spanSync('run', () => {
      return tree.accept(this);
    });
  }

  notImplemented(message: string): Value {
    throw new NotImplementedError(message, null);
  }

  //
  // Instructions
  //

  addConstant(value: Value): void {
    return spanSync('add constant', () => {
      this.stack.push(value);
    });
  }

  pop(): Value {
    return this.stack.pop();
  }

  //
  // TODO: These don't do any type checking right now. At a minimum I need
  // to check what the types of a/b are and switch accordingly. But I may
  // also want separate instructions for different types. I may also want
  // to have particular instructions for type conversions.
  //

  add(): Value {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) + (b as any));

    return undefined;
  }

  sub(): Value {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) - (b as any));

    return undefined;
  }

  mul(): Value {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) * (b as any));

    return undefined;
  }

  div(): Value {
    const b = this.stack.pop();
    const a = this.stack.pop();

    // TODO: Check types, return RuntimeErrors
    this.stack.push((a as any) / (b as any));

    return undefined;
  }

  neg(): Value {
    const a = this.stack.pop();

    this.stack.push(-(a as any));

    return undefined;
  }

  //
  // Visitors
  //

  visitCommandGroupTree(group: CommandGroup): Value {
    return spanSync('command group', () => {
      let rv: Value = undefined;
      for (const cmd of group.commands) {
        trace('command', cmd);
        rv = cmd.accept(this);
      }
      return rv;
    });
  }

  visitLineTree(line: Line): Value {
    return spanSync(`line ${line.lineNo}`, () => {
      this.lineNo = line.lineNo;
      this.isLine = true;
      let rv: Value = undefined;
      for (const cmd of line.commands) {
        rv = cmd.accept(this);
      }
      this.isLine = false;
      return rv;
    });
  }

  visitInputTree(input: Input): Value {
    return spanSync('input', () => {
      let rv: Value = undefined;
      for (const row of input.input) {
        trace('row', row);
        rv = row.accept(this);
      }
      return rv;
    });
  }

  visitProgramTree(_program: Program): Value {
    return spanSync('execute program', () => {
      return this.notImplemented('Program execution');
    });
  }

  visitExpressionCmd(expression: Expression): Value {
    return spanSync('expression command', () => {
      const expr = expression.expression;
      expr.accept(this);

      const value = this.stack.pop();

      trace('expression result', value);
      return value;
    });
  }

  visitPrintCmd(print: Print): Value {
    const expr = print.expression;
    expr.accept(this);

    const value = this.pop();
    this.host.writeLine(value);
    return undefined;
  }

  visitBinaryExpr(binary: Binary): Value {
    binary.left.accept(this);
    binary.right.accept(this);

    this[BINARY_OP[binary.op]]();

    return undefined;
  }

  visitLogicalExpr(logical: Logical): Value {
    logical.left.accept(this);
    logical.right.accept(this);

    this[LOGICAL_OP[logical.op]]();

    return undefined;
  }

  visitUnaryExpr(unary: Unary): Value {
    unary.expr.accept(this);

    this[UNARY_OP[unary.op]]();

    return undefined;
  }

  visitGroupExpr(group: Group): Value {
    return group.expr.accept(this);
  }

  visitIntLiteralExpr(int: IntLiteral): Value {
    this.addConstant(int.value);
    return undefined;
  }

  visitRealLiteralExpr(real: RealLiteral): Value {
    this.addConstant(real.value);
    return undefined;
  }

  visitBoolLiteralExpr(bool: BoolLiteral): Value {
    this.addConstant(bool.value);
    return undefined;
  }

  visitStringLiteralExpr(str: StringLiteral): Value {
    this.addConstant(str.value);
    return undefined;
  }

  visitPromptLiteralExpr(_ps: PromptLiteral): Value {
    return undefined;
  }

  visitNilLiteralExpr(_: NilLiteral): Value {
    this.addConstant(nil);
    return undefined;
  }
}
