import { Byte } from '../../bytecode/byte.mjs';
import { Chunk } from '../../bytecode/chunk.mjs';
import { Value } from '../../value/index.mjs';

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
