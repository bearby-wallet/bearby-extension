import { BaseError } from 'lib/error';

export class AccountError extends BaseError {
  name = 'Account';
}

export const NIL_ACCOUNT = 'Account not found';
export const INCORRECT_ACCOUNT = 'Account type is not correct';
