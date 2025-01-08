import { ShaAlgorithms } from "config/sha-algorithms";

export async function pbkdf2(
  password: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  algorithms = ShaAlgorithms.Sha512,
) {
  const passphraseKey = await globalThis.crypto.subtle.importKey(
    "raw",
    password,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );
  const webKey = await globalThis.crypto.subtle.deriveKey(
    {
      salt,
      iterations,
      name: "PBKDF2",
      hash: algorithms,
    },
    passphraseKey,
    {
      name: "HMAC",
      hash: algorithms,
      length: 512,
    },
    true,
    ["sign", "verify"],
  );
  const hash = await globalThis.crypto.subtle.exportKey("raw", webKey);

  return new Uint8Array(hash);
}
