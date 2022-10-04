import { BaseError } from 'lib/error';

export class GuardError extends BaseError {
  name = 'Guard';
}

export const WALLET_NOT_READY = 'Wallet is not created';
export const WALLET_NOT_SYNC = 'Wallet is not synced';
export const INCORRECT_PASSWORD = 'Incorrect password';
export const WALLET_NOT_ENABLED = 'Wallet is not enabled';
export const TIMER_MUST_BE_INT = 'Timer must be uint type.';
