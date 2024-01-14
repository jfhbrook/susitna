import { EventEmitter } from 'events';

export class Interrupt {
  private readonly events: EventEmitter;

  constructor() {
    this.events = new EventEmitter();
  }

  // .on, and .emit are more or less like those on standard
  // EventEmitters but may have custom types or logic - for example:
  //
  // - allowing only one interrupt function per event
  // - treating all interrupts as critical
  // - narrowing the types for a listener
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.events.on(eventName, listener);
    return this;
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    return this.events.emit(eventName, ...args);
  }

  // Yield the event loop so interrupts can execute - at a minimum this is
  // just an empty Promise, but will probably also involve waiting for async
  // interrupts to complete
  async yield(): Promise<void> {}

  // Check if a given interrupt is active. I'm hoping I don't need this and
  // can use this.yield() instead, but if debugger logic is spread across
  // multiple components, I might need something like this....
  active(eventName: string | symbol): boolean {
    return false;
  }

  // mark an active interrupt as having finished execution - this will allow
  // other interrupts to execute and/or allow yielding back to non-interrupt
  // behavior
  close(eventName: string | symbol): void {}

  // critical sections of code must complete before an interrupts can be
  // executed. async critical sections should generally be avoided, but just
  // in case...
  async critical(fn: () => Promise<void>): Promise<void> {}

  // non-critical sections of code which can be "canceled" to allow an
  // interrupt. this should be most/all async blocks.
  async forgiving(fn: () => Promise<void>): Promise<void> {}
}
