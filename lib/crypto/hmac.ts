import Sha512 from 'sha.js/sha512';
import { Buffer } from 'buffer';

import { TypeOf } from 'lib/type';

export class Hmac {
  #zeros: Buffer;
  #opad: Uint8Array;
  #hash: any;

  constructor(key: Buffer) {
    this.#zeros = Buffer.alloc(128);
    this.#hash = this.#sha();

    const blocksize = 128;

    if (key.length > blocksize) {
      key = this.#sha().update(key).digest();
    }

    if (key.length < blocksize) {
      key = Buffer.concat([key, this.#zeros], blocksize);
    }

    const ipad = new Uint8Array(blocksize);
    const opad = new Uint8Array(blocksize);

    this.#opad = opad;

    for (var i = 0; i < blocksize; i++) {
      ipad[i] = key[i] ^ 0x36;
      opad[i] = key[i] ^ 0x5C;
    }

    this.#hash.update(ipad);
  }

  public update(data: Buffer | string) {
    if (TypeOf.isString(data)) {
      data = Buffer.from(String(data));
    }

    this.#update(data as Buffer);

    return this;
  }

  #update(data: Buffer) {
    this.#hash.update(data);
  }

  digest() {
    const h = this.#hash.digest();

    return this.#sha().update(this.#opad).update(h).digest();
  }

  #sha() {
    return new Sha512();
  }
}
