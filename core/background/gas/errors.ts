import { BaseError } from 'lib/error';

export class GasError extends BaseError {
  name = 'GasError';
}

export const INVALID_GAS_LIMIT = 'Invalid gasLimit number';
export const INVALID_MULTIPLIER = 'Invalid multiplier';
export const INVALID_STATE = 'Invalid object state';
