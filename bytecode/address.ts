export type Address = number;
export type Pointer = Address | null;
export type Offset = Address;
export type ByteAddress = [number, number];

export function addrToBytes(addr: Address): ByteAddress {
  return [(addr >> 8) & 0xff, addr & 0xff];
}

export function bytesToAddr([first, second]: ByteAddress): Address {
  return (first << 8) | second;
}
