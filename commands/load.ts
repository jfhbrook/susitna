import { ValueError } from '../exceptions';
import { formatter } from '../format';
import { Load } from '../ast/instr';
import { CommandRunner, ReturnValue } from './base';

/**
 * Load a script, and optionally run it.
 */
export default async function load(
  this: CommandRunner,
  load: Load,
): Promise<ReturnValue> {
  const { executor, editor, host } = this;
  const [filename] = this.args;
  if (typeof filename !== 'string') {
    throw new ValueError(`Invalid filename; ${formatter.format(filename)}`);
  }
  await executor.load(filename);
  if (load.run) {
    await executor.run();
  } else if (editor.warning) {
    host.writeWarn(editor.warning);
  }
  return null;
}
