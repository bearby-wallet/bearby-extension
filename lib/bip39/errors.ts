import { BaseError } from "lib/error";

export class Bip39Error extends BaseError {
  name = 'Bip39';
}

export const INVALID_PUBLIC_KEY = 'PublicKey must be 32 or 64 bytes';
export const INVALID_PATH = 'Path must start with "m" or "M"';
export const INVALID_PATH_INDEX = 'Path index must integer';
export const COULD_NOT_DERIVE = 'Could not derive hardened';

export const INVALID_ENTROPY = 'Invalid entropy';
export const INCORRECT_MNEMONIC = 'Incorrect mnemonic';
