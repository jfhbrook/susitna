import { Module } from '@nestjs/common';

import { Interrupts } from './interrupts.service';

// Various things will be able to interrupt the interpreter. The main use
// case I have in mind is breaking into debug mode, but it will probably
// be generalizable to event handling in general (with the ON keyword)
//
// I haven't figured out how this abstraction works yet. It might actually
// need a handle on the runtime and other components, instead of those
// components getting handles to it - since an interrupt handler is global.

@Module({
  imports: [],
  providers: [Interrupts],
  exports: [Interrupts],
})
export class InterruptsModule {}
