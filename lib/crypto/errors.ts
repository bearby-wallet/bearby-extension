import { BaseError } from "lib/error";

export class AesError extends BaseError {
  name = "AesError";
}

export const INCORRECT_ARGS = "Incorrect arguments";
export const INCORRECT_STRING = "base58 must be string type";
export const INVALID_CHARS = "Invalid base58 character";

export const INVALID_U8_ARRAY =
  '"Uint8Array" argument must be a Uint8Array instance';
export const OUT_OF_BOUNDS = "argument is out of bounds";
export const OUT_OF_RANGE = "Index out of range";
