import type { KeyPair } from 'types/account';

import { utils } from 'aes-js';
import Ripemd160 from '@hicaru/ripemd160.js';
import secp256k1 from 'secp256k1/elliptic';
import { Buffer } from 'buffer';

import { assert } from 'lib/assert';
import { hmac } from 'lib/crypto/hmac';
import { addressFromPublicKey } from 'lib/address';
import { sha256 } from 'lib/crypto/sha256';
import { INVALID_PRIVATE_KEY } from 'lib/validator/errors';
import {
  Bip39Error,
  INVALID_PUBLIC_KEY,
  INVALID_PATH,
  INVALID_PATH_INDEX,
  COULD_NOT_DERIVE
} from './errors';


const MASTER_SECRET = utils.utf8.toBytes('Bitcoin seed');
const HARDENED_OFFSET = 0x80000000;
const BITCOIN_VERSIONS = {
  private: 0x0488ADE4,
  public: 0x0488B21E
};


export class HDKey {
  #privateKey?: Uint8Array;
  #publicKey?: Uint8Array;
  #fingerprint = 0;
  #identifier?: Uint8Array;

  public parentFingerprint = 0;
  public chainCode?: Uint8Array;
  public depth = 0;
  public index = 0;
  public versions: typeof BITCOIN_VERSIONS;

  public get publicKey() {
    return new Uint8Array(this.#publicKey || []);
  }

  public get privateKey() {
    return new Uint8Array(this.#privateKey || []);
  }

  constructor(versions = BITCOIN_VERSIONS) {
    this.versions = versions;
  }

  async setPrivateKey(value: Uint8Array) {
    assert(value.length === 32, INVALID_PRIVATE_KEY, Bip39Error);
    assert(secp256k1.privateKeyVerify(value) === true, INVALID_PRIVATE_KEY, Bip39Error);

    this.#privateKey = value;
    this.#publicKey = Buffer.from(secp256k1.publicKeyCreate(value, true));
    this.#identifier = Buffer.from(await this.#hash160(this.#publicKey));
    this.#fingerprint = Buffer.from(this.#identifier).slice(0, 4).readUInt32BE(0);
  }

  async setPublicKey(value: Buffer) {
    assert(value.length === 33 || value.length === 65, INVALID_PUBLIC_KEY, Bip39Error);
    assert(secp256k1.publicKeyVerify(value) === true, INVALID_PUBLIC_KEY, Bip39Error);

    // force compressed point
    this.#publicKey = Buffer.from(secp256k1.publicKeyConvert(value, true));
    this.#identifier = Buffer.from(await this.#hash160(this.publicKey));
    this.#fingerprint = Buffer.from(this.#identifier || []).slice(0, 4).readUInt32BE(0);
    this.#privateKey = undefined;
  }

  async keyPair(): Promise<KeyPair> {
    return {
      pubKey: this.publicKey,
      privKey: this.privateKey,
      base58: await addressFromPublicKey(this.publicKey)
    };
  }

  public setChainCode(ir: Uint8Array) {
    this.chainCode = ir;
  }

  async derive(path: string) {
    if (path === 'm' || path === 'M' || path === "m'" || path === "M'") {
      return this;
    }
  
    const entries = path.split('/');
    let hdkey: HDKey = this;

    for (let i = 0; i < entries.length; i++) {
      const c = entries[i];
      
      if (i === 0) {
        assert(/^[mM]{1}/.test(c), INVALID_PATH, Bip39Error);
        continue;
      }
  
      const hardened = (c.length > 1) && (c[c.length - 1] === "'");
      let childIndex = parseInt(c, 10); // & (HARDENED_OFFSET - 1)

      assert(childIndex < HARDENED_OFFSET, INVALID_PATH_INDEX, Bip39Error);

      if (hardened) {
        childIndex += HARDENED_OFFSET;
      }
  
      hdkey = await hdkey.deriveChild(childIndex);
    }

    return hdkey;
  }

  async deriveChild(index: number): Promise<HDKey> {
    const isHardened = index >= HARDENED_OFFSET;
    const indexBuffer = Buffer.allocUnsafe(4);

    indexBuffer.writeUInt32BE(index, 0);
  
    let data: Buffer;
  
    if (isHardened) { // Hardened child
      assert(Boolean(this.#privateKey), COULD_NOT_DERIVE, Bip39Error);
  
      let pk = Buffer.from(this.privateKey);
      let zb = Buffer.alloc(1, 0);
      pk = Buffer.concat([zb, pk]);
  
      // data = 0x00 || ser256(kpar) || ser32(index)
      data = Buffer.concat([pk, indexBuffer]);
    } else { // Normal child
      // data = serP(point(kpar)) || ser32(index)
      //      = serP(Kpar) || ser32(index)
      data = Buffer.concat([this.publicKey, indexBuffer]);
    }

    const I = await hmac(new Uint8Array(this.chainCode || []), data);
    const IL = Uint8Array.from(I.slice(0, 32));
    const IR = Uint8Array.from(I.slice(32));
    const hd = new HDKey(this.versions);

    // Private parent key -> private child key
    if (this.privateKey) {
      // ki = parse256(IL) + kpar (mod n)
      try {
        await hd.setPrivateKey(
          Uint8Array.from(secp256k1.privateKeyTweakAdd(this.privateKey, IL))
        );
        // throw if IL >= n || (privateKey + IL) === 0
      } catch (err) {
        // In case parse256(IL) >= n or ki == 0, one should proceed with the next value for i
        return this.deriveChild(index + 1);
      }
    // Public parent key -> public child key
    } else {
      // Ki = point(parse256(IL)) + Kpar
      //    = G*IL + Kpar
      try {
        await hd.setPublicKey(
          Buffer.from(secp256k1.publicKeyTweakAdd(this.publicKey, IL, true))
        );
        // throw if IL >= n || (g**IL + publicKey) is infinity
      } catch (err) {
        // In case parse256(IL) >= n or Ki is the point at infinity, one should proceed with the next value for i
        return this.deriveChild(index + 1);
      }
    }

    hd.chainCode = Buffer.from(IR);
    hd.depth = this.depth + 1;
    hd.parentFingerprint = this.#fingerprint; // .readUInt32BE(0)
    hd.index = index;
  
    return hd;
  }

  async fromMasterSeed(seedBuffer: Uint8Array, versions = BITCOIN_VERSIONS) {
    const I = await hmac(MASTER_SECRET, seedBuffer);

    const IL = Buffer.from(I).slice(0, 32);
    const IR = Buffer.from(I).slice(32);  
    const hdkey = new HDKey(versions);

    hdkey.setChainCode(IR);
    await hdkey.setPrivateKey(
      Uint8Array.from(IL)
    );
  
    return hdkey;
  }

  async #hash160(buf: Uint8Array) {
    const hash = await sha256(buf);
    return new Ripemd160()
      .update(hash)
      .digest();
  }
}
