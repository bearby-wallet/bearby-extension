import type { ArgTypes, NativeType } from 'config/arg-types';
import { utils } from 'aes-js';
import {
  serializableObjectsArrayToBytes,
  bytesToSerializableObjectArray,
  deserializeObj,
  nativeTypeArrayToBytes,
  bytesToNativeTypeArray
} from './arrays';
import {
  bytesToF32,
  bytesToF64,
  bytesToI32,
  bytesToI64,
  bytesToU32,
  bytesToU64,
  byteToU8,
  f32ToBytes,
  f64ToBytes,
  i32ToBytes,
  i64ToBytes,
  u32ToBytes,
  u64ToBytes,
  u8toByte,
} from './numbers';
import { DESERIALIZE_ERROR } from './errors';

export interface ISerializable<T> {
  serialize(): Uint8Array;
  deserialize(data: Uint8Array, offset: number): IDeserializedResult<T>;
}

export interface IDeserializedResult<T> {
  instance: T;
  offset: number;
}

export class Args {
  #offset = 0;
  #serialized: Uint8Array;

  /**
   * Constructor to either serialize or deserialize data passed from/to DApps and remote Smart contracts.
   *
   * @param serialized - The optional serialized arguments to deserialize.
   * @param offset - The optional offset to start deserializing from.
   */
  constructor(serialized: Array<number> | Uint8Array = [], offset = 0) {
    this.#serialized = Uint8Array.from(serialized);
    this.#offset = offset;
  }

  /**
   * Returns the current deserialization offset of the serialized byte array.
   *
   * @returns the current offset
   */
  getOffset(): number {
    return this.#offset;
  }

  /**
   * Returns the serialized byte array.
   *
   * @returns A byte array.
   */
  serialize(): Array<number> {
    return Array.from(this.#serialized);
  }

  // Getters

  /**
   * Returns the next string in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized string
   */
  nextString(): string {
    const length = this.nextU32();
    const end = this.#offset + length;
    const result = utils.utf8.fromBytes(this.#serialized.slice(this.#offset, end));

    this.#offset = end;
    return result;
  }

  /**
   * Returns the next unsigned byte in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized number.
   */
  nextU8(): bigint {
    const value = byteToU8(this.#serialized, this.#offset);

    this.#offset++;
    return BigInt(value);
  }

  /**
   * Returns the next unsigned integer in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized number
   */
  nextU32(): number {
    const value = bytesToU32(this.#serialized, this.#offset);

    this.#offset += 4;
    return value;
  }

  /**
   * Returns the next long integer in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized number.
   */
  nextU64(): bigint {
    const value = bytesToU64(this.#serialized, this.#offset);

    this.#offset += 8;
    return value;
  }

  /**
   * Returns the next boolean in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized boolean.
   */
  nextBool(): boolean {
    return !!this.#serialized[this.#offset++];
  }

  /**
   * Returns the next signed integer in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized number.
   */
  nextI32(): number {
    const value = bytesToI32(this.#serialized, this.#offset);

    this.#offset += 4;
    return value;
  }

  /**
   * Returns the next signed long integer in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized number.
   */
  nextI64(): bigint {
    const value = bytesToI64(this.#serialized, this.#offset);

    this.#offset += 8;
    return BigInt(value);
  }

  /**
   * Returns the next floating number in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized number.
   */
  nextF32(): number {
    const value = bytesToF32(this.#serialized, this.#offset);

    this.#offset += 4;
    return value;
  }

  /**
   * Returns the next long floating number in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized number.
   */
  nextF64(): number {
    const value = bytesToF64(this.#serialized, this.#offset);

    this.#offset += 8;
    return value;
  }

  /**
   * Returns the next sub byte array in the serialized byte array.
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @returns the deserialized byte array.
   */
  nextUint8Array(): Uint8Array {
    const length = this.nextU32();
    const byteArray = this.#serialized.slice(this.#offset, this.#offset + length);

    this.#offset += length;
    return byteArray;
  }

  /**
   * Returns the next {@link ISerializable} object in the serialized byte array
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @param ctor - the class constructor prototype T.prototype
   *
   * @returns the deserialized object T
   */
  nextSerializable<T extends ISerializable<T>>(ctor: new () => T): T {
    let deserializationResult = deserializeObj(
      this.#serialized,
      this.#offset,
      ctor,
    );
    this.#offset = deserializationResult.offset;
    return deserializationResult.instance;
  }

  /**
   * Returns the next array of {@link ISerializable} objects in the serialized byte array
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @param ctor - the class constructor prototype T.prototype
   *
   * @returns the deserialized array of object that implement ISerializable
   */
  nextSerializableObjectArray<T extends ISerializable<T>>(
    ctor: new () => T,
  ): T[] {
    const length = this.nextU32();
    if (this.#offset + length > this.#serialized.length) {
      throw new Error("can't deserialize length of array from given argument");
    }

    const bufferSize = length;

    if (bufferSize === 0) {
      return [];
    }

    const buffer = this.#getNextData(bufferSize);

    const value = bytesToSerializableObjectArray<T>(buffer, ctor);
    this.#offset += bufferSize;
    return value;
  }

  /**
   * Returns the next array of {@link TypedArrayUnit} objects in the serialized byte array
   *
   * @remarks
   * Increments to offset to point the data after the one that as been deserialized in the byte array.
   *
   * @param typedArrayType - the type of the elements in the array.
   *
   * @returns the next array of object that are native type
   */
  nextNativeTypeArray<T extends ArgTypes>(typedArrayType: T): T[] {
    const length = this.nextU32();
    if (this.#offset + length > this.#serialized.length) {
      throw new Error(DESERIALIZE_ERROR);
    }

    const bufferSize = length;

    if (bufferSize === 0) {
      return [];
    }

    const buffer = this.#getNextData(bufferSize);
    const value = bytesToNativeTypeArray<T>(buffer, typedArrayType);
    this.#offset += bufferSize;
    return value;
  }

  // Setter

  /**
   * Adds a unsigned byte to the serialized arguments.
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addU8(value: number): Args {
    this.#serialized = this.#concatArrays(this.#serialized, u8toByte(value));
    this.#offset++;
    return this;
  }

  /**
   * Adds a boolean to the serialized arguments.
   *
   * @param value - the boolean to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addBool(value: boolean): Args {
    this.#serialized = this.#concatArrays(
      this.#serialized,
      u8toByte(value ? 1 : 0),
    );
    this.#offset++;
    return this;
  }

  /**
   * Adds an unsigned integer to the serialized arguments.
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addU32(value: number): Args {
    this.#serialized = this.#concatArrays(this.#serialized, u32ToBytes(value));
    this.#offset += 4;
    return this;
  }

  /**
   * Adds an unsigned long integer to the serialized arguments.
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addU64(bigInt: bigint): Args {
    this.#serialized = this.#concatArrays(this.#serialized, u64ToBytes(bigInt));

    this.#offset += 8;

    return this;
  }

  /**
   * Adds a signed integer to the serialized arguments.
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addI32(value: number): Args {
    this.#serialized = this.#concatArrays(this.#serialized, i32ToBytes(value));
    this.#offset += 4;
    return this;
  }

  /**
   * Adds a signed long integer to the serialized arguments.
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addI64(bigInt: bigint): Args {
    this.#serialized = this.#concatArrays(this.#serialized, i64ToBytes(bigInt));
    this.#offset += 8;
    return this;
  }

  /**
   * Adds a floating number to the serialized arguments.
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addF32(value: number): Args {
    this.#serialized = this.#concatArrays(this.#serialized, f32ToBytes(value));
    this.#offset += 4;
    return this;
  }

  /**
   * Adds a long floating number to the serialized arguments.
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addF64(value: number): Args {
    this.#serialized = this.#concatArrays(this.#serialized, f64ToBytes(value));
    this.#offset += 8;
    return this;
  }

  /**
   * Adds a byte array integer to the serialized arguments.
   *
   * @param array - the array to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addUint8Array(array: Uint8Array): Args {
    this.addU32(array.length);
    this.#serialized = this.#concatArrays(this.#serialized, array);
    this.#offset += array.length;
    return this;
  }

  /**
   * Adds a string to the serialized arguments.
   *
   * @remarks
   * Works only if the argument is an instance of a handled type (String of 4294967295 characters maximum)
   *
   * @param value - the number to add.
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addString(arg: string): Args {
    const maxSize = 4294967295;
    const size = arg.length;

    if (size > maxSize) {
      console.warn('input string is too long, it will be truncated');
      arg = arg.slice(0, maxSize);
    }

    const serialized = utils.utf8.toBytes(arg);
    this.addU32(serialized.length);

    this.#serialized = this.#concatArrays(this.#serialized, utils.utf8.toBytes(arg));

    return this;
  }

  /**
   * Adds a serializable object to the serialized arguments.
   *
   * @remarks
   * The object must implement the {@link ISerializable} interface
   *
   * @see {@link ISerializable}
   *
   * @param value - the object to add
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addSerializable<T>(value: ISerializable<T>): Args {
    const serializedValue = value.serialize();
    this.#serialized = this.#concatArrays(this.#serialized, serializedValue);
    this.#offset += serializedValue.length;
    return this;
  }

  /**
   * Adds an array of serializable objects to the serialized arguments.
   *
   * @remarks
   * Each object must implement the {@link ISerializable} interface.
   * This will perform a deep copy of your objects thanks to the {@link ISerializable.serialize}
   * method you define in your class.
   *
   * @see {@link ISerializable}
   *
   * @param arg - the argument to add
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addSerializableObjectArray<T extends ISerializable<T>>(
    arg: T[],
  ): Args {
    const content: Uint8Array = serializableObjectsArrayToBytes(arg);
    this.addU32(content.length);
    this.#serialized = this.#concatArrays(this.#serialized, content);
    return this;
  }

  /**
   * Adds an array of objects to the serialized arguments.
   *
   * @remarks
   * If the type of the values of the array is not native type, this will serialize the pointers, which is certainly
   * not what you want! You can only serialize properly array of native types or array of `Serializable` object.
   *
   * @see {@link addSerializableObjectArray}
   *
   * @param arg - the argument to add
   *
   * @returns the serialized arguments to be able to chain `add` method calls.
   */
  addNativeTypeArray<T extends ArgTypes>(
    arg: NativeType[],
    type: T,
  ): Args {
    const content = nativeTypeArrayToBytes(arg, type);
    this.addU32(content.length);
    this.#serialized = this.#concatArrays(this.#serialized, content);
    return this;
  }

  // Utils

  /**
   * Internal function to concat to Uint8Array.
   *
   * @param a - first array to concat
   * @param b - second array to concat
   *
   * @returns the concatenated array
   */
  #concatArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
    return new Uint8Array([...a, ...b]);
  }

  /**
   * Returns the data of requested size for current offset
   *
   * @param size - The data size
   * @returns the slice of the serialized internal buffer
   */
  #getNextData(size: number): Uint8Array {
    return this.#serialized.slice(this.#offset, this.#offset + size);
  }
}
