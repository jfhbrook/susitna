import { trace, spanSync } from './trace';

import { Exception, NotImplementedError } from './exceptions';
import { Host } from './host';
import { Result, Ok, Err, Warn } from './result';
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

// TODO: Right now, I'm using this Result to:
//
// 1. Short circuit on errors
// 2. Return values from expression commands
//
// What I'd rather do is:
//
// - Add Exceptions to the stack and call and unwind() instruction
// - Handle expression command results with a callback to Commander
//   - There may be other ways of handling this, but I want to implement
//     a callback pattern anyway
//   - Can't keep them on the stack because prior expression results get
//     thrown away
export type RuntimeResult = Result<Value, Exception>;

export class Runtime
  implements
    TreeVisitor<RuntimeResult>,
    CmdVisitor<RuntimeResult>,
    ExprVisitor<RuntimeResult>
{
  public stack: Stack;
  private lineNo: number = 0;
  private isLine: boolean = false;

  constructor(private host: Host) {
    this.stack = new Stack();
  }

  run(tree: Input | Program): RuntimeResult {
    return spanSync('run', () => {
      return tree.accept(this);
    });
  }

  notImplemented(message: string): RuntimeResult {
    return new Err(undefined, new NotImplementedError(message, null));
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

  add(): RuntimeResult {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) + (b as any));

    return new Ok(undefined);
  }

  sub(): RuntimeResult {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) - (b as any));

    return new Ok(undefined);
  }

  mul(): RuntimeResult {
    const b = this.stack.pop();
    const a = this.stack.pop();

    this.stack.push((a as any) * (b as any));

    return new Ok(undefined);
  }

  div(): RuntimeResult {
    const b = this.stack.pop();
    const a = this.stack.pop();

    // TODO: Check types, return RuntimeErrors
    this.stack.push((a as any) / (b as any));

    return new Ok(undefined);
  }

  neg(): RuntimeResult {
    const a = this.stack.pop();

    this.stack.push(-(a as any));

    return new Ok(undefined);
  }

  //
  // Visitors
  //

  visitCommandGroupTree(group: CommandGroup): RuntimeResult {
    return spanSync('command group', () => {
      let rv: RuntimeResult = new Ok(undefined);
      for (const cmd of group.commands) {
        trace('command', cmd);
        rv = cmd.accept(this);
        if (rv instanceof Err) {
          return rv;
        }
      }
      return rv;
    });
  }

  visitLineTree(line: Line): RuntimeResult {
    return spanSync(`line ${line.lineNo}`, () => {
      this.lineNo = line.lineNo;
      this.isLine = true;
      let rv: RuntimeResult = new Ok(undefined);
      for (const cmd of line.commands) {
        rv = cmd.accept(this);
        if (rv instanceof Err) {
          return rv;
        }
      }
      this.isLine = false;
      return rv;
    });
  }

  visitInputTree(input: Input): RuntimeResult {
    return spanSync('input', () => {
      let rv: RuntimeResult = new Ok(undefined);
      for (const row of input.input) {
        trace('row', row);
        rv = row.accept(this);
        if (rv instanceof Err) {
          return rv;
        }
      }
      return rv;
    });
  }

  visitProgramTree(_program: Program): RuntimeResult {
    return spanSync('execute program', () => {
      return this.notImplemented('Program execution');
    });
  }

  visitExpressionCmd(expression: Expression): RuntimeResult {
    return spanSync('expression command', () => {
      const expr = expression.expression;
      const rv = expr.accept(this);

      if (rv instanceof Err) {
        return rv;
      }

      const value = this.stack.pop();

      trace('expression result', value);
      return new Ok(value);
    });
  }

  visitPrintCmd(print: Print): RuntimeResult {
    const expr = print.expression;
    const rv = expr.accept(this);

    if (rv instanceof Err) {
      return rv;
    }

    if (rv instanceof Warn) {
      this.host.writeWarn(rv.warning);
    }

    const value = this.pop();
    this.host.writeLine(value);
    return new Ok(undefined);
  }

  visitBinaryExpr(binary: Binary): RuntimeResult {
    binary.left.accept(this);
    binary.right.accept(this);

    this[BINARY_OP[binary.op]]();

    return new Ok(undefined);
  }

  visitLogicalExpr(logical: Logical): RuntimeResult {
    logical.left.accept(this);
    logical.right.accept(this);

    this[LOGICAL_OP[logical.op]]();

    return new Ok(undefined);
  }

  visitUnaryExpr(unary: Unary): RuntimeResult {
    unary.expr.accept(this);

    this[UNARY_OP[unary.op]]();

    return new Ok(undefined);
  }

  visitGroupExpr(group: Group): RuntimeResult {
    return group.expr.accept(this);
  }

  visitIntLiteralExpr(int: IntLiteral): RuntimeResult {
    this.addConstant(int.value);
    return new Ok(undefined);
  }

  visitRealLiteralExpr(real: RealLiteral): RuntimeResult {
    this.addConstant(real.value);
    return new Ok(undefined);
  }

  visitBoolLiteralExpr(bool: BoolLiteral): RuntimeResult {
    this.addConstant(bool.value);
    return new Ok(undefined);
  }

  visitStringLiteralExpr(str: StringLiteral): RuntimeResult {
    this.addConstant(str.value);
    return new Ok(undefined);
  }

  visitPromptLiteralExpr(_ps: PromptLiteral): RuntimeResult {
    return new Ok(undefined);
  }

  visitNilLiteralExpr(_: NilLiteral): RuntimeResult {
    this.addConstant(nil);
    return new Ok(undefined);
  }
}
