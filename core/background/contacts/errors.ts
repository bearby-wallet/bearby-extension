import { BaseError } from 'lib/error';

export class ContactsError extends BaseError {
  name = 'ContactsError';
}

export const UINIQE_NAME = 'name must be unique';
export const UINIQE_ADDRESS = 'address must be unique';
export const INVALID_BASE58 = 'invalid base58 address';
