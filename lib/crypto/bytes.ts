import { assert } from 'lib/assert';
import { INVALID_U8_ARRAY, OUT_OF_BOUNDS, OUT_OF_RANGE } from './errors';

function checkInt (
  buf: Uint8Array,
  value: number,
  offset: number,
  ext: number,
  max: number,
  min: number
) {
  assert(buf instanceof Uint8Array, INVALID_U8_ARRAY);

  if (value > max || value < min) {
    throw new RangeError(OUT_OF_BOUNDS);
  }
  if (offset + ext > buf.length) {
    throw new RangeError(OUT_OF_RANGE);
  }
}


export function writeUint32BE(source: Uint8Array, value: number, offset: number, noAssert?: boolean): Uint8Array {
  source = Uint8Array.from(source);
  value = Number(value);
  offset = offset >>> 0;

  if (!noAssert) {
    checkInt(source, value, offset, 4, 0xffffffff, 0);
  }

  source[offset] = (value >>> 24)
  source[offset + 1] = (value >>> 16)
  source[offset + 2] = (value >>> 8)
  source[offset + 3] = (value & 0xff)

  return source;
}
