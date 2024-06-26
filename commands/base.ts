import { getTracer } from '../debug';
import { errorType } from '../errors';
import { RuntimeFault } from '../faults';
import { Value } from '../value';
import { Cmd, CmdVisitor } from '../ast/cmd';

const tracer = getTracer('main');

/**
 * The return value of a command. Null is used to indicate no returned
 * value, not even nil.
 */
export type ReturnValue = Value | null;

/**
 * An interactive command.
 */
export type InteractiveCommand<C extends Cmd> = (
  this: CommandRunner,
  cmd: C,
) => ReturnValue;

export interface CommandRunner extends CmdVisitor<ReturnValue> {
  args: Value[];
}

@errorType('Invalid')
export class Invalid extends Error {
  constructor(name: string) {
    super(`Invalid command: ${name}`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Create an invalid command. Invalid commands should never be executed
 * by the Commander, as they should be fully implemented in the runtime.
 *
 * @param name The name of the invalid command.
 * @returns An interactive command that will immediately throw a RuntimeFault
 */
export function invalid<C extends Cmd>(name: string): InteractiveCommand<C> {
  return function invalidCommand(_cmd: C): Value | null {
    throw RuntimeFault.fromError(new Invalid(name));
  };
}

/**
 * Create a no-op command. These commands won't throw, but don't do anything
 * either. The primary example of this is the Rem "command".
 *
 * @param cmd The no-op command
 * @returns null
 */
export function noop<C extends Cmd>(_cmd: C): Value | null {
  return null;
}

export function trace<C extends Cmd>(
  name: string,
  command: InteractiveCommand<C>,
): InteractiveCommand<C> {
  return function traced(this: CommandRunner, cmd: C): ReturnValue {
    return tracer.spanSync(`Evaluating ${name}`, () => {
      tracer.trace('with args:', this.args);
      return command.call(this, cmd);
    });
  };
}
