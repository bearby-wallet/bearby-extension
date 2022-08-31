import { BaseError } from 'lib/error';


export class MassaHttpError extends BaseError {
  name = 'MassaHttpError';
}


export const REQUEST_FALLED = 'Request to node failed';
