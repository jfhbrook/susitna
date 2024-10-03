import { DebugTracer } from '../../debug.mjs';

export class MockTracer extends DebugTracer {
  messages: any[] = [];

  _log(...args: any[]): void {
    this.messages.push(args);
  }
}
