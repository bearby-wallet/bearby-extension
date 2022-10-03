import { BaseError } from 'lib/error';

export class TransactionsError extends BaseError {
  name = 'TransactionsError';
}

export const NOT_FOUND_CONFIRM = 'No transaction with such index';
export const UNKONOW_TX_TYPE = 'Unknow tx type';
