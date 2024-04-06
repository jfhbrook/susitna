import { Tracer } from '../../trace';

export class MockTracer extends Tracer {
  messages: any[] = [];

  _log(...args: any[]): void {
    this.messages.push(args);
  }
}
