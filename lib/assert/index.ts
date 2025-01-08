import { BaseError } from "lib/error";

export function assert(expressions: boolean, msg: string, Error = BaseError) {
  if (!expressions) {
    throw new Error(msg);
  }
}
