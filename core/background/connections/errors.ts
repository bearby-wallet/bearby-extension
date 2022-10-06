import { BaseError } from 'lib/error';

export class ConnectionsError extends BaseError {
  name = 'ConnectionsError';
}

export const APP_UNIQUE = 'App must be unique';
export const INCORRECT_PARAM = 'Nulish param ';
export const QUEUED = 'App already queued';
