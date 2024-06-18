import { DebugTracer } from '../../debug';

export class MockTracer extends DebugTracer {
  messages: any[] = [];

  _log(...args: any[]): void {
    this.messages.push(args);
  }
}
