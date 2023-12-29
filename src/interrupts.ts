import { EventEmitter } from 'events';

export class Interrupts extends EventEmitter {
  // some way of handling "critical" async sections which need to be cleaned
  // up if interrupted
  async critical(event: string, fn: () => Promise<void>): Promise<void> {
  }
}
