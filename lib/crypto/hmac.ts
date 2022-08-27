import { ShaAlgorithms } from 'config/sha-algorithms';


export async function hmac(secret: Uint8Array, body: Uint8Array, algorithm = ShaAlgorithms.Sha512) {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    secret,
    {
        name: "HMAC",
        hash: {
          name: algorithm
        }
    },
    false,
    ["sign", "verify"]
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    body
  );
  
  return new Uint8Array(signature);
}
