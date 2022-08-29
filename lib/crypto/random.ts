const QUOTA = 65536;
/**
 * randomBytes
 *
 * Uses JS-native CSPRNG to generate a specified number of bytes.
 * NOTE: this method throws if no PRNG is available.
 */
//  export const randomBytes = (bytes: number): string => {
//   const b = new Uint8Array(bytes);
//   const n = b.byteLength;

//   let crypto = globalThis.crypto;

//   if (!crypto) {
//     // @ts-ignore
//     // for IE 11
//     crypto = globalThis.msCrypto;
//   }

//   if (!crypto) {
//     crypto = require("crypto");
//   }

//   assert(Boolean(crypto && crypto.getRandomValues), 'IsNotSecureRNG');

//   // For browser or web worker enviroment, use window.crypto.getRandomValues()
//   // https://paragonie.com/blog/2016/05/how-generate-secure-random-numbers-in-various-programming-languages#js-csprng

//   // limit of getRandomValues()
//   // The requested length exceeds 65536 bytes.
//   // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#exceptions
//   const MAX_BYTES = 65536;

//   for (let i = 0; i < n; i += MAX_BYTES) {
//     crypto.getRandomValues(
//       new Uint8Array(b.buffer, i + b.byteOffset, Math.min(n - i, MAX_BYTES)),
//     );
//   }

//   const randBz = new Uint8Array(
//     b.buffer,
//     b.byteOffset,
//     b.byteLength / Uint8Array.BYTES_PER_ELEMENT,
//   );

//   let randStr = '';

//   for (let i = 0; i < bytes; i++) {
//     randStr += ('00' + randBz[i].toString(16)).slice(-2);
//   }

//   return randStr;
// };

export function randomBytes(length: number): Uint8Array {
  const crypto = globalThis.crypto;
  const a = new Uint8Array(length);

  for (var i = 0; i < length; i += QUOTA) {
    crypto.getRandomValues(a.subarray(i, i + Math.min(length - i, QUOTA)));
  }

  return a;
};
