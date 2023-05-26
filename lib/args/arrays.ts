import type { ISerializable, IDeserializedResult } from './args';
import { utils } from 'aes-js';
import { NativeType, ArgTypes } from 'config/arg-types';
import { INVALID_TYPE } from './errors';

const MAX_STRING_CHARS = 100;

function getDatatypeSize(typedArrayType: ArgTypes): number {
  switch (typedArrayType) {
    case ArgTypes.STRING:
      return MAX_STRING_CHARS;
    case ArgTypes.BOOL:
      return 1;
    case ArgTypes.F32:
      return 4;
    case ArgTypes.F64:
      return 8;
    case ArgTypes.I32:
      return 4;
    case ArgTypes.I64:
      return 8;
    case ArgTypes.U8:
      return 1;
    case ArgTypes.U32:
      return 4;
    case ArgTypes.U64:
      return 8;
    default:
      throw new Error(INVALID_TYPE);
  }
};

export function serializableObjectsArrayToBytes<T extends ISerializable<T>>(
  source: T[],
): Uint8Array {
  const nbElements = source.length;
  const pointers = new Array<Uint8Array>(nbElements);
  const sizes = new Array<number>(nbElements);
  let totalLength = 0;

  for (let i = 0; i < nbElements; i++) {
    const bytes: Uint8Array = source[i].serialize();

    pointers[i] = bytes;
    sizes[i] = bytes.length;
    totalLength += bytes.length;
  }

  const target = new Uint8Array(totalLength);

  let offset = 0;
  for (let i = 0; i < nbElements; i++) {
    target.set(pointers[i], offset);
    offset += sizes[i];
  }

  return target;
}

export function deserializeObj<T extends ISerializable<T>>(
  data: Uint8Array,
  offset: number,
  Clazz: new () => T,
): IDeserializedResult<T> {
  const deserialized = new Clazz().deserialize(data, offset);
  return deserialized;
}

export function bytesToSerializableObjectArray<T extends ISerializable<T>>(
  source: Uint8Array,
  Clazz: new () => T,
): T[] {
  const array: T[] = [];
  let offset = 0;

  while (offset < source.length) {
    let deserializationResult = deserializeObj(source, offset, Clazz);
    offset = deserializationResult.offset;
    array.push(deserializationResult.instance);
  }

  return array;
}

export function nativeTypeArrayToBytes<T extends ArgTypes>(
  source: NativeType[],
  type: T,
): Uint8Array {
  const sourceLength = source.length;

  // Calculate the target length based on the type size and source length
  const targetLength = sourceLength * getDatatypeSize(type);

  // allocates a new Uint8Array in the memory
  let target = new Uint8Array(targetLength);

  for (let i = 0; i < sourceLength; i++) {
    const value = source[i];
    // For boolean and number values, we can just write them to the target buffer directly
    const view = new DataView(
      target.buffer,
      target.byteOffset + i * getDatatypeSize(type),
    );
    switch (type) {
      case ArgTypes.STRING:
        if (String(value).length > MAX_STRING_CHARS) {
          throw new Error(
            `String has more than ${MAX_STRING_CHARS} (max.). Please limit your strings to ${MAX_STRING_CHARS} chars`,
          );
        }
        const b: Uint8Array = utils.utf8.toBytes(String(value));
        for (let j = 0; j < b.length; j++) {
          view.setUint8(j, b[j]);
        }
        break;
      case ArgTypes.BOOL:
        view.setUint8(0, value ? 1 : 0);
        break;
      case ArgTypes.U8:
        view.setUint8(0, value as number);
        break;
      case ArgTypes.F64:
        view.setFloat64(0, value as number, true);
        break;
      case ArgTypes.F32:
        view.setFloat32(0, value as number, true);
        break;
      case ArgTypes.I32:
        view.setInt32(0, value as number, true);
        break;
      case ArgTypes.I64:
        view.setBigInt64(0, BigInt(value as bigint), true);
        break;
      case ArgTypes.U32:
        view.setUint32(0, value as number, true);
        break;
      case ArgTypes.U64:
        view.setBigUint64(0, BigInt(value as bigint), true);
        break;
      default:
        throw new Error(`Unsupported type ${type}`);
    }
  }
  return target;
}

export function bytesToNativeTypeArray<T extends ArgTypes>(
  source: Uint8Array,
  typedArrayType: T,
): T[] {
  const sourceLength = source.length;
  // Calculate the total length of the array
  let targetLength = sourceLength / getDatatypeSize(typedArrayType);
  if (!(targetLength % 1 === 0)) {
    throw new Error(`None-integer array length computation`);
  }
  const dataView = new DataView(source.buffer);

  // Create a new typed array of type T and fill it with the converted values
  const result: T[] = [];
  let byteOffset = 0;
  for (let i = 0; i < targetLength; i++) {
    const size = getDatatypeSize(typedArrayType);
    switch (typedArrayType) {
      case ArgTypes.STRING:
        let dataArr = [];
        for (let j = 0; j < size; j++) {
          const letter = dataView.getUint8(byteOffset + j);
          if (letter <= 0) continue;
          dataArr.push(letter);
        }
        result.push(utils.utf8.fromBytes(Uint8Array.from(dataArr)) as unknown as T);
        break;
      case ArgTypes.BOOL:
        const boolVal = source[i] === 1 ? true : false;
        result.push(boolVal as unknown as T);
        break;
      case ArgTypes.U8:
        result.push(source[i] as unknown as T);
        break;
      case ArgTypes.F32:
        result.push(dataView.getFloat32(byteOffset, true) as unknown as T);
        break;
      case ArgTypes.F64:
        result.push(dataView.getFloat64(byteOffset, true) as unknown as T);
        break;
      case ArgTypes.I32:
        result.push(dataView.getInt32(byteOffset, true) as unknown as T);
        break;
      case ArgTypes.I64:
        result.push(dataView.getBigInt64(byteOffset, true) as unknown as T);
        break;
      case ArgTypes.U32:
        result.push(dataView.getUint32(byteOffset, true) as unknown as T);
        break;
      case ArgTypes.U64:
        result.push(dataView.getBigUint64(byteOffset, true) as unknown as T);
        break;
    }
    byteOffset += size;
  }
  return result;
}
