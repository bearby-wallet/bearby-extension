const U8_MAX = 0xff;
const U32_MAX = 0xffffffff;
const U64_MAX = BigInt('0xffffffffffffffff');
const I32_MIN = -0x80000000;
const I32_MAX = 0x7fffffff;
const I64_MIN = BigInt('-9223372036854775808');
const I64_MAX = BigInt('0x7fffffffffffffff');

export function u8toByte(val: number): Uint8Array {
  if (val < 0 || val > U8_MAX) {
    throw new Error(`Unable to serialize invalid Uint8 value ${val}`);
  }
  return new Uint8Array([val]);
}

export function byteToU8(arr: Uint8Array, offset = 0): number {
  return arr[offset];
}

export function u32ToBytes(val: number): Uint8Array {
  if (val < 0 || val > U32_MAX) {
    throw new Error(`Unable to serialize invalid Uint32 value ${val}`);
  }
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, val, true);
  return new Uint8Array(view.buffer);
}

export function bytesToU32(arr: Uint8Array, offset = 0): number {
  const view = new DataView(arr.buffer);
  return view.getUint32(offset, true);
}

export function u64ToBytes(val: bigint): Uint8Array {
  if (val < 0 || val > U64_MAX) {
    throw new Error(`Unable to serialize invalid Uint64 value ${val}`);
  }
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, val, true);
  return new Uint8Array(view.buffer);
}

export function bytesToU64(arr: Uint8Array, offset = 0): bigint {
  const view = new DataView(arr.buffer);
  return view.getBigUint64(offset, true);
}

export function i32ToBytes(val: number): Uint8Array {
  if (val < I32_MIN || val > I32_MAX) {
    throw new Error(`Unable to serialize invalid int32 value ${val}`);
  }
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, val, true);
  return new Uint8Array(view.buffer);
}

export function bytesToI32(arr: Uint8Array, offset = 0): number {
  const view = new DataView(arr.buffer);
  return view.getInt32(offset, true);
}

export function i64ToBytes(val: bigint): Uint8Array {
  if (val < I64_MIN || val > I64_MAX) {
    throw new Error(
      `Unable to serialize invalid int64 value ${val.toString()}`,
    );
  }
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigInt64(0, val, true);
  return new Uint8Array(view.buffer);
}

export function bytesToI64(arr: Uint8Array, offset = 0): bigint {
  const view = new DataView(arr.buffer);
  return view.getBigInt64(offset, true);
}

export function f32ToBytes(val: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, val, true);
  return new Uint8Array(view.buffer);
}

export function bytesToF32(arr: Uint8Array, offset = 0): number {
  const view = new DataView(arr.buffer);
  return view.getFloat32(offset, true);
}

export function f64ToBytes(val: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, val, true);
  return new Uint8Array(view.buffer);
}

export function bytesToF64(arr: Uint8Array, offset = 0): number {
  const view = new DataView(arr.buffer);
  return view.getFloat64(offset, true);
}
