import type { CallParam } from "types/contacts";
import { Args } from "./args";
import { ArgTypes, NativeType } from 'config/arg-types';
import { BaseError } from "lib/error";
import { NOT_SUPOPRT_TYPE_SERIALIZABLE, NOT_SUPOPRT_TYPE_SERIALIZABLE_OBJECT_ARRAY } from "./errors";


export function parseParams(params: CallParam[]): Args {
  let args = new Args();

  for (const element of params) {
    switch (element.type) {
      case ArgTypes.U8:
        args.addU8(Number(element.value));
        continue;
      case ArgTypes.F32:
        args.addF32(Number(element.value));
        continue;
      case ArgTypes.U32:
        args.addI64(BigInt(element.value as NativeType));
        continue;
      case ArgTypes.I32:
        args.addI32(Number(element.value));
        continue;
      case ArgTypes.F64:
        args.addF64(Number(element.value));
        continue;
      case ArgTypes.I64:
        args.addI64(BigInt(element.value as NativeType));
        continue;
      case ArgTypes.U64:
        args.addU64(BigInt(element.value as NativeType));
        continue;
      case ArgTypes.U128:
        args.addU128(BigInt(element.value as NativeType));
        continue;
      case ArgTypes.U256:
        args.addU256(BigInt(element.value as NativeType));
        continue;
      case ArgTypes.BOOL:
        args.addBool(Boolean(element.value));
        continue;
      case ArgTypes.STRING:
        args.addString(String(element.value));
        continue;
      case ArgTypes.ARRAY:
        args.addArray(element.value as NativeType[], element.type);
        continue;
      case ArgTypes.UINT8ARRAY:
        args.addUint8Array(element.value as Uint8Array);
        continue;
      case ArgTypes.SERIALIZABLE_OBJECT_ARRAY:
        throw new BaseError(NOT_SUPOPRT_TYPE_SERIALIZABLE_OBJECT_ARRAY);
      case ArgTypes.SERIALIZABLE:
        throw new BaseError(NOT_SUPOPRT_TYPE_SERIALIZABLE);
      default:
        continue;
    }
  }

  return args;
}

