import { ArgTypes, NativeType } from 'config/arg-types';

export interface Contact {
  name: string;
  address: string;
}

export interface CallParam {
  type: ArgTypes;
  vname?: string;
  value: NativeType | NativeType[] | Uint8Array;
}
