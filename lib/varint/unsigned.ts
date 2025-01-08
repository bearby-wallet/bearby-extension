import { BaseError } from "lib/error";

const LIMIT = BigInt(0x7f);
const zeroBI = BigInt(0);
const sevenBI = BigInt(7);

export function encodingLength(value: bigint): number {
  let i = 0;

  for (; value >= BigInt(0x80); i++) {
    value >>= sevenBI;
  }

  return i + 1;
}

export function encode(
  i: bigint,
  buffer?: Uint8Array | ArrayBuffer,
  byteOffset = 0,
): Uint8Array {
  if (i < zeroBI) {
    throw new RangeError("value must be unsigned");
  }

  const byteLength = encodingLength(i);

  let uint8Array: Uint8Array;
  if (!buffer) {
    uint8Array = new Uint8Array(byteLength);
  } else if (buffer instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(buffer, byteOffset);
  } else {
    uint8Array = buffer;
  }

  if (uint8Array.byteLength < byteOffset + byteLength) {
    throw new BaseError(
      "the buffer is too small to encode the number at the offset",
    );
  }

  let offset = 0;
  while (LIMIT < i) {
    uint8Array[offset++] = Number(i & LIMIT) | 0x80;
    i >>= sevenBI;
  }

  uint8Array[offset] = Number(i);

  return uint8Array;
}

export function decode(data: Uint8Array, offset = 0): bigint {
  let i = zeroBI;
  let n = 0;
  let b: number;
  do {
    b = data[offset + n];
    if (b === undefined) {
      throw new BaseError("offset out of range");
    }

    i += BigInt(b & 0x7f) << BigInt(n * 7);
    n++;
  } while (0x80 <= b);
  return i;
}
