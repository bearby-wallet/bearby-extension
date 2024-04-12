import * as unsigned from './unsigned'

const oneBI = BigInt(1);
const twoBI = BigInt(2);

export function encodingLength(value: bigint): number {
  return unsigned.encodingLength(
    value >= 0 ? value * twoBI : value * -twoBI - oneBI
  );
}

export function encode(
  value: bigint,
  buffer?: ArrayBuffer,
  byteOffset?: number
): ArrayBuffer {
  value = value >= 0 ? value * twoBI : value * -twoBI - oneBI;

  return unsigned.encode(value, buffer, byteOffset);
}

export function decode(data: Uint8Array, offset = 0): bigint {
  const value = unsigned.decode(data, offset);
  return value & oneBI ? (value + oneBI) / -twoBI : value / twoBI;
}
