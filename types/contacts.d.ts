import { ArgTypes, NativeType } from "config/arg-types";

export interface Contact {
  name: string;
  address: string;
}

export interface CallParam {
  type: ArgTypes;
  vname?: string;
  value: NativeType | NativeType[] | Uint8Array;
}

export interface SCReadData {
  caller_address?: string;
  max_gas: number;
  parameter: number[];
  target_address: string;
  target_function: string;
}
