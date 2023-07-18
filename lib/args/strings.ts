import { utils } from "aes-js";

/**
 * Converts utf-16 string to a Uint8Array.
 *
 * @param str - the string to convert
 *
 * @returns the converted string
 */
export function strToBytes(str: string): Uint8Array {
  if (!str.length) {
    return Uint8Array.from([0]);
  }

  return utils.utf8.toBytes(str);
}

/**
 * Converts Uint8Array to a string.
 *
 * @param arr - the array to convert
 *
 * @returns the converted array
 */
export function bytesToStr(arr: Uint8Array): string {
  if (!arr.length) {
    return '';
  }
  return utils.utf8.fromBytes(arr);
}
