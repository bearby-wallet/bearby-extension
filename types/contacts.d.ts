import { ArgTypes } from 'config/arg-types';

export interface Contact {
  name: string;
  address: string;
}

export interface CallParam {
  type: ArgTypes;
  value: string | bigint | number | boolean;
}

