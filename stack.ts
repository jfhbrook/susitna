import { Formattable, Formatter } from './format';
import { Value } from './value';

export class Stack implements Formattable {
  public stack: Value[] = [];

  push(value: Value): void {
    this.stack.push(value);
  }

  pop(): Value | null {
    return this.stack.pop() || null;
  }

  peek(): Value | null {
    if (this.empty) {
      return null;
    }
    return this.stack[this.stack.length - 1];
  }

  get empty(): boolean {
    return this.stack.length === 0;
  }

  get size(): number {
    return this.stack.length;
  }

  reset(): void {
    this.stack = [];
  }

  format(formatter: Formatter): string {
    return formatter.formatStack(this);
  }
}
