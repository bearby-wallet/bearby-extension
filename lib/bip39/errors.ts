import { BaseError } from "lib/error";

export class Bip39Error extends BaseError {
  name = 'Bip39';
}

export const INVALID_PATH_INDEX = 'Path index must integer';
export const INVALID_PATH = 'Invalid derivation path';
export const CHAIN_CODE_EMPTY = 'chainCode is empty';

export const INVALID_ENTROPY = 'Invalid entropy';
export const INCORRECT_MNEMONIC = 'Incorrect mnemonic';
