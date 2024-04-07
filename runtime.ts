import { trace, spanSync } from './trace';

import { Exception, NotImplementedError } from './exceptions';
import { formatter } from './format';
import { Host } from './host';
import { Result, Ok, Err, Warn } from './result';
import { renderPrompt } from './shell';
import { Value, nil } from './value';

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

export type RuntimeResult = Result<Value | null, Exception>;

export class Runtime
  implements
    TreeVisitor<RuntimeResult>,
    CmdVisitor<RuntimeResult>,
    ExprVisitor<RuntimeResult>
{
  private lineNo: number = 0;
  private isLine: boolean = false;

  constructor(private host: Host) {}

  run(tree: Input | Program): RuntimeResult {
    return tree.accept(this);
  }

  visitCommandGroupTree(group: CommandGroup): RuntimeResult {
    return spanSync('execute command group', () => {
      let rv: RuntimeResult = new Ok(null);
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
    return spanSync(`execute line ${line.lineNo}`, () => {
      this.lineNo = line.lineNo;
      this.isLine = true;
      let rv: RuntimeResult = new Ok(null);
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
    return spanSync('execute input', () => {
      let rv: RuntimeResult = new Ok(null);
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
      return new Err(
        null,
        new NotImplementedError('Program execution is not implemented', null),
      );
    });
  }

  visitExpressionCmd(expression: Expression): RuntimeResult {
    return spanSync('execute expression command', () => {
      const expr = expression.expression;
      const value = expr.accept(this);
      trace('expression result', value);
      return value;
    });
  }

  visitPrintCmd(print: Print): RuntimeResult {
    const expr = print.expression;
    const value = expr.accept(this);

    if (value instanceof Err) {
      return value;
    }

    if (value instanceof Warn) {
      this.host.writeWarn(value.warning);
    }
    this.host.writeOut(formatter.format(value.result) + '\n');
    return new Ok(undefined);
  }

  visitBinaryExpr(_binary: Binary): RuntimeResult {
    return new Ok(nil);
  }

  visitLogicalExpr(_logical: Logical): RuntimeResult {
    return new Ok(nil);
  }

  visitUnaryExpr(_unary: Unary): RuntimeResult {
    return new Ok(nil);
  }

  visitGroupExpr(_group: Group): RuntimeResult {
    return new Ok(nil);
  }

  visitIntLiteralExpr(int: IntLiteral): RuntimeResult {
    return new Ok(int.value);
  }

  visitRealLiteralExpr(real: RealLiteral): RuntimeResult {
    return new Ok(real.value);
  }

  visitBoolLiteralExpr(bool: BoolLiteral): RuntimeResult {
    return new Ok(bool.value);
  }

  visitStringLiteralExpr(str: StringLiteral): RuntimeResult {
    return new Ok(str.value);
  }

  visitPromptLiteralExpr(ps: PromptLiteral): RuntimeResult {
    return new Ok(renderPrompt(ps.value, this.host));
  }

  visitNilLiteralExpr(_: NilLiteral): RuntimeResult {
    return new Ok(nil);
  }
}
