import type { Fields } from "config/fields";

import { TypeOf } from "lib/type";

export type StorageKeyValue = {
  [key: string]: string;
};

/**
 * Through this class can build payload for write to browser Storage.
 * @example
 * import { buildObject, BrowserStorage } from 'lib/storage'
 * new BrowserStorage().set([
 *  buildObject('key', 'any payload or object or array')
 * ])
 */
export function buildObject(
  key: Fields | string,
  value: string | object,
): StorageKeyValue {
  let data = value;

  if (TypeOf.isObject(value) || TypeOf.isArray(value)) {
    data = JSON.stringify(data);
  }

  return {
    [key]: String(data),
  };
}
