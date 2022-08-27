
export async function sha256(value: Uint8Array) {
  const crypto = globalThis.crypto;
  const hash = await crypto.subtle.digest('SHA-256', value);
  return new Uint8Array(hash);
}
