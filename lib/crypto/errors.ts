import { BaseError } from 'lib/error';


export class AesError extends BaseError {
  name = 'AesError';
}

export const INCORRECT_ARGS = 'Incorrect arguments';
export const INCORRECT_STRING = 'base58 must be string type';
export const INVALID_CHARS = 'Invalid base58 character';
