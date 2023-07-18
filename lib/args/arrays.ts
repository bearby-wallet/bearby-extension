import { type ISerializable, type IDeserializedResult, Args } from './args';
import { NativeType, ArgTypes } from 'config/arg-types';
import { bytesToStr } from './strings';
import { byteToBool } from './bool';
import {
  byteToU8,
  bytesToF32,
  bytesToF64,
  bytesToI32,
  bytesToI64,
  bytesToU128,
  bytesToU256,
  bytesToU32,
  bytesToU64
} from './numbers';
import { BaseError } from 'lib/error';
import { INVALID_TYPE } from './errors';


/**
 * Get the byte size of a typed array unit.
 *
 * @param typedArgTypes - The typed array unit to get the size of.
 *
 * @returns The size of the typed array unit.
 */
export const getDatatypeSize = (type: ArgTypes): number => {
  switch (type) {
    case ArgTypes.BOOL:
    case ArgTypes.U8:
      return 1;
    case ArgTypes.F32:
    case ArgTypes.I32:
    case ArgTypes.U32:
      return 4;
    case ArgTypes.F64:
    case ArgTypes.I64:
    case ArgTypes.U64:
      return 8;
    case ArgTypes.U128:
      return 16;
    case ArgTypes.U256:
      return 32;
    default:
      throw new BaseError(INVALID_TYPE);
  }
};

/**
 * Serializes an array of serializable objects to bytes.
 *
 * @param source - The array of serializable objects to serialize.
 *
 * @returns The serialized array as Uint8Array.
 */
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

/**
 * Deserializes a bytes array into an array of deserialized objects.
 *
 * @param data - The bytes array to deserialize.
 * @param offset - The offset to start deserializing from.
 * @param Clazz - The class used for deserialization.
 *
 * @returns The deserialized array of objects.
 */
export function deserializeObj<T extends ISerializable<T>>(
  data: Uint8Array,
  offset: number,
  Clazz: new () => T,
): IDeserializedResult<T> {
  const deserialized = new Clazz().deserialize(data, offset);
  return deserialized;
}

/**
 * Converts a Uint8Array into an array of deserialized type parameters.
 *
 * @param source - The Uint8Array to convert.
 * @param Clazz - The class constructor for deserialization.
 *
 * @returns An array of deserialized objects.
 */
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

/**
 * Convert an array of native types to a Uint8Array.
 *
 * @remarks
 * This function performs a deep copy for native types only.
 * It is inspired by https://github.com/AssemblyScript/assemblyscript/blob/main/std/assembly/array.ts#L69-L81
 *
 * @param source - The array to convert.
 * @param type - The typed array unit type.
 *
 * @returns The converted Uint8Array.
 */
export function arrayToBytes(
  source: NativeType[],
  type: ArgTypes,
): Uint8Array {
  let args = new Args();
  source.forEach((value) => {
    switch (type) {
      case ArgTypes.STRING:
        args.addString(value as string);
        break;
      case ArgTypes.BOOL:
        args.addBool(value as boolean);
        break;
      case ArgTypes.U8:
        args.addU8(value as number);
        break;
      case ArgTypes.F64:
        args.addF64(value as number);
        break;
      case ArgTypes.F32:
        args.addF32(value as number);
        break;
      case ArgTypes.I32:
        args.addI32(value as number);
        break;
      case ArgTypes.I64:
        args.addI64(value as bigint);
        break;
      case ArgTypes.U32:
        args.addU32(value as number);
        break;
      case ArgTypes.U64:
        args.addU64(value as bigint);
        break;
      case ArgTypes.U128:
        args.addU128(value as bigint);
        break;
      case ArgTypes.U256:
        args.addU256(value as bigint);
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  });
  return new Uint8Array(args.serialize());
}

/**
 * Converts a Uint8Array into an array of native types.
 *
 * @remarks
 * This function is inspired by https://github.com/AssemblyScript/assemblyscript/blob/main/std/assembly/array.ts#L69-L81
 *
 * @param source - The Uint8Array to convert.
 * @param type - The typed array unit type.
 *
 * @returns An array of converted native types.
 */
export function bytesToArray<T>(source: Uint8Array, type: ArgTypes): T[] {
  const sourceLength = source.length;

  let byteOffset = 0;
  const result: T[] = [];
  let eltSize = 0;

  if (type !== ArgTypes.STRING) {
    eltSize = getDatatypeSize(type);
  }

  while (byteOffset < sourceLength) {
    if (type === ArgTypes.STRING) {
      eltSize = bytesToU32(source, byteOffset);
      byteOffset += 4;
    }
    const elt = source.slice(byteOffset, byteOffset + eltSize);
    byteOffset += eltSize;

    switch (type) {
      case ArgTypes.STRING:
        result.push(bytesToStr(elt) as T);
        break;
      case ArgTypes.BOOL:
        result.push(byteToBool(elt) as T);
        break;
      case ArgTypes.U8:
        result.push(byteToU8(elt) as T);
        break;
      case ArgTypes.F32:
        result.push(bytesToF32(elt) as T);
        break;
      case ArgTypes.F64:
        result.push(bytesToF64(elt) as T);
        break;
      case ArgTypes.I32:
        result.push(bytesToI32(elt) as T);
        break;
      case ArgTypes.I64:
        result.push(bytesToI64(elt) as T);
        break;
      case ArgTypes.U32:
        result.push(bytesToU32(elt) as T);
        break;
      case ArgTypes.U64:
        result.push(bytesToU64(elt) as T);
        break;
      case ArgTypes.U128:
        result.push(bytesToU128(elt) as T);
        break;
      case ArgTypes.U256:
        result.push(bytesToU256(elt) as T);
        break;
    }
  }
  return result;
}
