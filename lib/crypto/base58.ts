import { TypeOf } from "lib/type";
import { assert } from "lib/assert";
import { INCORRECT_STRING, INVALID_CHARS } from "./errors";

// Base58 characters must only include numbers 123456789, uppercase ABCDEFGHJKLMNPQRSTUVWXYZ and lowercase abcdefghijkmnopqrstuvwxyz.
const base58Chars =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const base58Map = createBase58Map();

/**
 * Generates a mapping between base58 and ascii.
 * @name create_base58_map
 * @kind function
 * @returns {Array} mapping between ascii and base58.
 * @ignore
 */
function createBase58Map(): number[] {
  const base58M: number[] = Array(256).fill(-1);

  for (let i = 0; i < base58Chars.length; ++i) {
    base58M[base58Chars.charCodeAt(i)] = i;
  }

  return base58M;
}

/**
 * Converts a `base58` string to its corresponding binary representation.
 * @kind function
 * @name base58_to_binary
 * @param {base58Chars} base58String base58 encoded string
 * @returns {Uint8Array} binary representation for the base58 string.
 * @example <caption>Usage.</caption>
 * ```js
 * const bin = base58_to_binary("6MRy")
 * console.log(bin)
 * ```
 * Logged output will be Uint8Array(3) [15, 239, 64].
 */
export function base58ToBinary(base58String: string): Uint8Array {
  assert(
    Boolean(base58String) && TypeOf.isString(base58String),
    INCORRECT_STRING,
  );
  assert(
    !Boolean(base58String.match(/[IOl0]/gmu)),
    INVALID_CHARS + base58String.match(/[IOl0]/gmu),
  );

  const lz = base58String.match(/^1+/gmu);
  const psz = lz ? lz[0].length : 0;
  const size =
    ((base58String.length - psz) * (Math.log(58) / Math.log(256)) + 1) >>> 0;

  return new Uint8Array([
    ...new Uint8Array(psz),
    ...(base58String.match(/.{1}/gmu) || [])
      .map((i) => base58Chars.indexOf(i))
      .reduce((acc, i) => {
        acc = acc.map((j) => {
          const x = j * 58 + i;

          i = x >> 8;

          return x;
        });
        return acc;
      }, new Uint8Array(size))
      .reverse()
      .filter(
        (
          (lastValue: boolean | number) => (value) =>
            (lastValue = lastValue || value)
        )(false),
      ),
  ]);
}

/**
 * Converts a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) into a base58 string.
 * @kind function
 * @name binaryToBase58
 * @param {Uint8Array | Array} uint8array Unsigned integer.
 * @returns {base58Chars} The base58 string representation of the binary array.
 * @example <caption>Usage.</caption>
 * ```js
 * const str = binary_to_base58([15, 239, 64])
 * console.log(str)
 * ```
 * Logged output will be 6MRy.
 */
export function binaryToBase58(uint8array: Uint8Array): string {
  const result = [];

  for (const byte of uint8array) {
    let carry = byte;

    for (let j = 0; j < result.length; ++j) {
      const x: number = (base58Map[result[j]] << 8) + carry;

      result[j] = base58Chars.charCodeAt(x % 58);

      carry = (x / 58) | 0;
    }

    while (carry) {
      result.push(base58Chars.charCodeAt(carry % 58));
      carry = (carry / 58) | 0;
    }
  }

  for (const byte of uint8array) {
    if (byte) break;
    else result.push("1".charCodeAt(0));
  }

  result.reverse();

  return String.fromCharCode(...result);
}
