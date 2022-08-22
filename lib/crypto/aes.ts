import type { Buffer } from 'buffer';
import { Counter, utils, ModeOfOperation } from 'aes-js';
import { assert } from 'lib/assert';


const counter = 5;
export const Aes = Object.freeze({
  encrypt(content: Buffer, key: Buffer) {
    assert(Boolean(content), 'IncorrectParams');
    assert(Boolean(key), 'IncorrectParams');

    const aesCtr = new ModeOfOperation.ctr(
      key, new Counter(counter)
    );

    return aesCtr.encrypt(content);
  },
  decrypt(encryptedBytes: Buffer, key: Buffer) {
    const aesCtr = new ModeOfOperation.ctr(
      key,
      new Counter(counter)
    );
    const bytes = aesCtr.decrypt(encryptedBytes);

    return utils.utf8.fromBytes(bytes);
  }
});
