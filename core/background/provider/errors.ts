import { BaseError } from 'lib/error';


export class MassaHttpError extends BaseError {
  name = 'MassaHttpError';
}


export const REQUEST_FALLED = 'Request to node failed';
export const EMPTY_ACCOUNT = 'Account is empty';
export const INCORRECT_PUB_KEY = 'invalid pubKey or sig';
export const INVLID_RECIPIENT = 'recipient base58 address';
