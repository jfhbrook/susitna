import { Byte } from '../../bytecode/byte';
import { Chunk } from '../../bytecode/chunk';
import { Value } from '../../value';

export interface ChunkProps {
  constants: Value[];
  code: Byte[];
  lines: number[];
}

export function chunk(props: ChunkProps): Chunk {
  const ch = new Chunk();
  Object.assign(ch, props);
  return ch;
}
