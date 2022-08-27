
export async function sha512(value: Uint8Array) {
  const crypto = globalThis.crypto;
  return crypto.subtle.digest('SHA-512', value); 
}
