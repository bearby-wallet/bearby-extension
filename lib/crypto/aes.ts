import { Counter, utils, ModeOfOperation } from 'aes-js';
import { assert } from 'lib/assert';


const counter = 5;
export const KeyChain = Object.freeze({
  encrypt(data: string, hash: string) {
    assert(Boolean(data), 'IncorrectParams');
    assert(Boolean(hash), 'IncorrectParams');

    const key = utils.hex.toBytes(hash);
    const content = utils.utf8.toBytes(data);
    const aesCtr = new ModeOfOperation.ctr(
      key, new Counter(counter)
    );

    return aesCtr.encrypt(content);
  },
  decrypt(encryptedHex: string, hash: string) {
    const key = utils.hex.toBytes(hash);
    const encryptedBytes = utils.hex.toBytes(encryptedHex);
    const aesCtr = new ModeOfOperation.ctr(
      key,
      new Counter(counter)
    );
    const bytes = aesCtr.decrypt(encryptedBytes);

    return utils.utf8.fromBytes(bytes);
  }
});
