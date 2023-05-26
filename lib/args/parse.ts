import type { CallParam } from "types/contacts";
import { Args } from "./args";
import { ArgTypes } from 'config/arg-types';


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
        args.addI64(BigInt(element.value));
        continue;
      case ArgTypes.I32:
        args.addI32(Number(element.value));
        continue;
      case ArgTypes.F64:
        args.addF64(Number(element.value));
        continue;
      case ArgTypes.I64:
        args.addI64(BigInt(element.value));
        continue;
      case ArgTypes.U64:
        args.addU64(BigInt(element.value));
        continue;
      case ArgTypes.BOOL:
        args.addBool(Boolean(element.value));
        continue;
      case ArgTypes.STRING:
        args.addString(String(element.value));
        continue;
      default:
        continue;
    }
  }

  return args;
}

