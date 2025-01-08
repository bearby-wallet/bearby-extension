import { Counter, ModeOfOperation, utils } from "aes-js";
import { assert } from "lib/assert";
import { randomBytes } from "lib/crypto/random";
import { AesError, INCORRECT_ARGS } from "./errors";

export const Cipher = Object.freeze({
  encrypt(content: Uint8Array, key: Uint8Array) {
    assert(Boolean(content), INCORRECT_ARGS, AesError);
    assert(Boolean(key), INCORRECT_ARGS, AesError);

    const entropy = randomBytes(16);
    const iv = new Counter(entropy);
    const aesCtr = new ModeOfOperation.ctr(key, iv);
    const encrypted = aesCtr.encrypt(content);
    const bytes = utils.utf8.toBytes(
      `${utils.hex.fromBytes(encrypted)}/${utils.hex.fromBytes(entropy)}`,
    );

    return bytes;
  },
  decrypt(bytes: Uint8Array, key: Uint8Array) {
    assert(Boolean(bytes), INCORRECT_ARGS, AesError);
    assert(Boolean(key), INCORRECT_ARGS, AesError);

    const [encrypted, iv] = utils.utf8.fromBytes(bytes).split("/");

    const counter = new Counter(utils.hex.toBytes(iv));
    const aesCtr = new ModeOfOperation.ctr(key, counter);

    return aesCtr.decrypt(utils.hex.toBytes(encrypted));
  },
});
