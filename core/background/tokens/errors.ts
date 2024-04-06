import { BaseError } from 'lib/error';

export const FAIL_FETCH_TOKEN_STATE = 'Fail to fetch token state.';
export const INVALID_DECIMALS = 'Invalid decimals';
export const INVALID_NAME = 'Invalid name';
export const INVALID_SYMBOL = 'Invalid symbol';
export const TOKEN_UNIQUE = 'Token should be Unique';

export class TokenError extends BaseError {
  name = 'TokenError';
}
