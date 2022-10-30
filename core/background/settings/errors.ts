import { BaseError } from 'lib/error';

export class SettingsError extends BaseError {
  name = 'SettingsError';
}

export const INVALID_THEME = 'Invalid theme';
export const INVALID_CURREENCY = 'Invalid currency';
export const INVALID_PERIOD = 'Invalid period format';
