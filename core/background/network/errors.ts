import { BaseError } from "lib/error";

export class NetworkError extends BaseError {
  name = "NetworkError";
}

export const FAIL_SYNC = "Fail to sync network";
export const INVALID_SELECTED = "selected network is empty";
export const INVALID_CONFIG = "new config is invalid";
export const UNIQUE_PROVIDER = "Provider must be unique";
export const ONLY_CUSTOM = "Selected netwrok should be custom";
