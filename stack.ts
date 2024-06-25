import { Formattable, Formatter } from './format';

export class Stack<V> implements Formattable {
  public stack: V[] = [];

  push(value: V): void {
    this.stack.push(value);
  }

  pop(): V | null {
    const val = this.stack.pop();
    if (val === undefined) {
      return null;
    }
    return val;
  }

  peek(): V | null {
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
