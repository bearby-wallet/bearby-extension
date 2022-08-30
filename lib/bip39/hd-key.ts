import type { KeyPair } from 'types/account';

import * as nacl from 'tweetnacl/nacl-fast.js';
import { Buffer } from 'buffer';

import { hmac } from 'lib/crypto/hmac';
import { utils } from 'aes-js';
import { assert } from 'lib/assert';
import { addressFromPublicKey } from 'lib/address';
import { CHAIN_CODE_EMPTY, INVALID_PATH, INVALID_PATH_INDEX } from './errors';


const ED25519_CURVE = utils.utf8.toBytes('ed25519 seed');
const HARDENED_OFFSET = 0x80000000;
const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
const replaceDerive = (val: string): string => val.replace("'", '');


export class HDKey {

  static isValidPath(path: string) {
    if (!pathRegex.test(path)) {
      return false;
    }

    return !path
      .split('/')
      .slice(1)
      .map(replaceDerive)
      .some((v) => isNaN(Number(v)));
  }

  #key = new Uint8Array(32);
  #chainCode = new Uint8Array(32);

  get publicKey() {
    assert(Boolean(this.#chainCode && this.#chainCode.length > 0), CHAIN_CODE_EMPTY);

    const privateKey = Uint8Array.from(this.#key || []);
    const keyPair = nacl.sign.keyPair.fromSeed(privateKey);
    const signPk = keyPair.secretKey.subarray(32);

    return Buffer.from(signPk);
  }

  get privateKey() {
    return this.#key;
  }

  get chainCode() {
    return this.#chainCode;
  }

  async keyPair(): Promise<KeyPair> {
    const pubKey = this.publicKey;
    return {
      pubKey,
      privKey: this.privateKey,
      base58: await addressFromPublicKey(pubKey)
    };
  }

  async #fromMasterSeed(seed: Uint8Array) {
    const I = await hmac(ED25519_CURVE, seed);

    this.#key = I.slice(0, 32);
    this.#chainCode = I.slice(32);
  }

  async #deriveChild(index: number) {
    assert(index < 0 || index > 2147483647, INVALID_PATH_INDEX);
    assert(Boolean(this.#chainCode && this.#chainCode.length > 0), CHAIN_CODE_EMPTY);

    const key = Uint8Array.from(this.#key || []);
    const indexBuffer = Buffer.allocUnsafe(4);
    indexBuffer.writeUInt32BE(index, 0);

    const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);
    const I = await hmac(Uint8Array.from(this.#chainCode || []), data);

    this.#key = I.slice(0, 32);
    this.#chainCode = I.slice(32);
  }

  async derivePath(path: string, seed: Uint8Array, offset = HARDENED_OFFSET) {
    assert(HDKey.isValidPath(path), INVALID_PATH);

    await this.#fromMasterSeed(seed);

    const segments = path
      .split('/')
      .slice(1)
      .map(replaceDerive)
      .map(el => parseInt(el, 10));

    for (const segment of segments) {
      await this.#deriveChild(segment + offset);
    }
  }
}
