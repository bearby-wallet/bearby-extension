export enum ArgTypes {
  STRING,
  BOOL,
  U8,
  U32,
  U64,
  U128,
  U256,
  I32,
  I64,
  F32,
  F64,
  ARRAY,
  UINT8ARRAY,
  SERIALIZABLE,
  SERIALIZABLE_OBJECT_ARRAY,
}

export type NativeType = string | boolean | number | bigint;
