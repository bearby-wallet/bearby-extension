import { ShaAlgorithms } from "config/sha-algorithms";

export async function sha256(value: Uint8Array) {
  const crypto = globalThis.crypto;
  const hash = await crypto.subtle.digest(ShaAlgorithms.sha256, value);
  return new Uint8Array(hash);
}
