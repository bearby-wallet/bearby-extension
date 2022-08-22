import { Counter, ModeOfOperation } from 'aes-js';
import { assert } from 'lib/assert';
import { randomBytes } from 'lib/crypto/random';
import { AesError, INCORRECT_ARGS } from './errors';


export const Cipher = Object.freeze({
  encrypt(content: Uint8Array, key: Uint8Array) {
    assert(Boolean(content), INCORRECT_ARGS, AesError);
    assert(Boolean(key), INCORRECT_ARGS, AesError);

    const entropy = randomBytes(16);
    const iv = new Counter(entropy);
    const aesCtr = new ModeOfOperation.ctr(key, iv);

    return {
      iv: entropy,
      encrypted: aesCtr.encrypt(content)
    };
  },
  decrypt(encryptedBytes: Uint8Array, key: Uint8Array, entropy: Uint8Array) {
    assert(Boolean(encryptedBytes), INCORRECT_ARGS, AesError);
    assert(Boolean(key), INCORRECT_ARGS, AesError);

    const iv = new Counter(entropy);
    const aesCtr = new ModeOfOperation.ctr(
      key,
      iv
    );

    return aesCtr.decrypt(encryptedBytes);
  }
});
