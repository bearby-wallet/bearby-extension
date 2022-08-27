export async function pbkdf2(password: Uint8Array, salt: Uint8Array, iterations: number) {
  const passphraseKey = await globalThis.crypto.subtle.importKey(
    'raw', 
    password, 
    { name: 'PBKDF2' }, 
    false, 
    ['deriveBits', 'deriveKey']
  );
  const webKey = await globalThis.crypto.subtle.deriveKey(
    {
      salt,
      iterations,
      name: 'PBKDF2',
      "hash": 'SHA-512'
    },
    passphraseKey,
    {
      name: "HMAC",
      hash: "SHA-512",
      length: 512
    },
    true,
    ["sign", "verify"]
  );
  const hash = await globalThis.crypto.subtle.exportKey("raw", webKey);

  return new Uint8Array(hash);
}
