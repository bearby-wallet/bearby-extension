import { ArgTypes } from 'config/arg-types';

export interface Contact {
  name: string;
  address: string;
}

export interface CallParam {
  type: ArgTypes;
  vname?: string;
  value: string | bigint | number | boolean;
}
