import type { KeyPair } from "types/account";

import { hmac } from "lib/crypto/hmac";
import { utils } from "aes-js";
import { assert } from "lib/assert";
import {
  addressFromPublicKey,
  publicKeyBytesFromPrivateKey,
} from "lib/address";
import { CHAIN_CODE_EMPTY, INVALID_PATH, INVALID_PATH_INDEX } from "./errors";
import { writeUint32BE } from "lib/crypto/bytes";
import { USER_VERSION_NUMBER } from "config/common";

const ED25519_CURVE = utils.utf8.toBytes("ed25519 seed");
const HARDENED_OFFSET = 0x80000000;
const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
const replaceDerive = (val: string): string => val.replace("'", "");

export class HDKey {
  static isValidPath(path: string) {
    if (!pathRegex.test(path)) {
      return false;
    }

    return !path
      .split("/")
      .slice(1)
      .map(replaceDerive)
      .some((v) => isNaN(Number(v)));
  }

  #key = new Uint8Array(32);
  #chainCode = new Uint8Array(32);

  get privateKey() {
    return this.#key;
  }

  get chainCode() {
    return this.#chainCode;
  }

  async keyPair(): Promise<KeyPair> {
    const pubKey = await this.getPublicKey();

    return {
      ...pubKey,
      privKey: this.privateKey,
      base58: await addressFromPublicKey(pubKey),
    };
  }

  async getPublicKey() {
    assert(
      Boolean(this.#chainCode && this.#chainCode.length > 0),
      CHAIN_CODE_EMPTY,
    );

    const privKey = Uint8Array.from(this.#key);

    return publicKeyBytesFromPrivateKey({
      privKey,
      version: USER_VERSION_NUMBER,
    });
  }

  async #fromMasterSeed(seed: Uint8Array) {
    const I = await hmac(ED25519_CURVE, seed);

    this.#key = I.slice(0, 32);
    this.#chainCode = I.slice(32);
  }

  async #deriveChild(index: number) {
    assert(index < 0 || index > 2147483647, INVALID_PATH_INDEX);
    assert(
      Boolean(this.#chainCode && this.#chainCode.length > 0),
      CHAIN_CODE_EMPTY,
    );

    const key = Uint8Array.from(this.#key || []);
    const indexBuffer = writeUint32BE(new Uint8Array(4), index, 0);
    const data = Uint8Array.from([
      ...new Uint8Array(1),
      ...key,
      ...indexBuffer,
    ]);
    const I = await hmac(Uint8Array.from(this.#chainCode || []), data);

    this.#key = I.slice(0, 32);
    this.#chainCode = I.slice(32);
  }

  async derivePath(path: string, seed: Uint8Array, offset = HARDENED_OFFSET) {
    assert(HDKey.isValidPath(path), INVALID_PATH);

    await this.#fromMasterSeed(seed);

    const segments = path
      .split("/")
      .slice(1)
      .map(replaceDerive)
      .map((el) => parseInt(el, 10));

    for (const segment of segments) {
      await this.#deriveChild(segment + offset);
    }
  }
}
