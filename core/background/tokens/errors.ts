import { BaseError } from 'lib/error';

export const FAIL_FETCH_TOKEN_STATE = 'Fail to fetch token state.';

export class TokenError extends BaseError {
  name = 'TokenError';
}
