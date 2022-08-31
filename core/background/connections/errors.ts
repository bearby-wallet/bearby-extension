import { BaseError } from 'lib/error';

export class ConnectionsError extends BaseError {
  name = 'ConnectionsError';
}

export const APP_UNIQUE = 'App must be unique';

