import { Byte } from './byte.mjs';

export type Short = number;
export type Bytes = [Byte, Byte];

export function shortToBytes(short: Short): Bytes {
  return [(short >> 8) & 0xff, short & 0xff];
}

export function bytesToShort([first, second]: Bytes): Short {
  return (first << 8) | second;
}
