import { Buffer } from 'buffer';
import sha256 from 'hash.js/lib/hash/sha/256';
import sha512 from 'hash.js/lib/hash/sha/512';
import Hmac from 'hash.js/lib/hash/hmac';
import { ripemd160 } from 'hash.js/lib/hash/ripemd';
import secp256k1 from 'secp256k1/elliptic';

import { assert } from 'lib/assert';
import { utils } from 'aes-js';
import { addressFromPublicKey } from 'lib/address';
import { INVALID_PRIVATE_KEY } from 'lib/validator/errors';
import {
  Bip39Error,
  INVALID_PUBLIC_KEY,
  INVALID_PATH,
  INVALID_PATH_INDEX,
  COULD_NOT_DERIVE
} from './errors';


const MASTER_SECRET = Buffer.from('Bitcoin seed', 'utf8');
const HARDENED_OFFSET = 0x80000000;
const BITCOIN_VERSIONS = {
  private: 0x0488ADE4,
  public: 0x0488B21E
};


export class HDKey {
  #privateKey?: Uint8Array;
  #publicKey?: Buffer;
  #fingerprint = 0;
  #identifier?: Buffer;

  public parentFingerprint = 0;
  public chainCode?: Buffer | number[];
  public depth = 0;
  public index = 0;
  public versions: typeof BITCOIN_VERSIONS;

  public set privateKey(value: Uint8Array) {
    assert(value.length === 32, INVALID_PRIVATE_KEY, Bip39Error);
    assert(secp256k1.privateKeyVerify(value) === true, INVALID_PRIVATE_KEY, Bip39Error);

    this.#privateKey = value;
    this.#publicKey = Buffer.from(secp256k1.publicKeyCreate(value, true));
    this.#identifier = Buffer.from(this.#hash160(this.#publicKey));
    this.#fingerprint = this.#identifier.slice(0, 4).readUInt32BE(0);
  }

  public set publicKey(value: Buffer) {
    assert(value.length === 33 || value.length === 65, INVALID_PUBLIC_KEY, Bip39Error);
    assert(secp256k1.publicKeyVerify(value) === true, INVALID_PUBLIC_KEY, Bip39Error);

    // force compressed point
    this.#publicKey = Buffer.from(secp256k1.publicKeyConvert(value, true));
    this.#identifier = this.#hash160(this.publicKey);
    this.#fingerprint = Buffer.from(this.#identifier || []).slice(0, 4).readUInt32BE(0);
    this.#privateKey = undefined;
  }

  public get keyPair() {
    return {
      pubKey: this.publicKey,
      privKey: this.privateKey,
      base58: addressFromPublicKey(this.publicKey)
    };
  }

  public get publicKey() {
    return Buffer.from(this.#publicKey || []);
  }

  public get privateKey(): Buffer {
    return Buffer.from(this.#privateKey || []);
  }

  constructor(versions = BITCOIN_VERSIONS) {
    this.versions = versions;
  }

  public setChainCode(ir: Buffer | number[]) {
    this.chainCode = ir;
  }

  public derive(path: string) {
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
  
      hdkey = hdkey.deriveChild(childIndex);
    }

    return hdkey;
  }

  public deriveChild(index: number): HDKey {
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

    const I = Hmac(sha512, this.chainCode)
      .update(data)
      .digest();
    const IL = Uint8Array.from(I.slice(0, 32));
    const IR = Uint8Array.from(I.slice(32));
    const hd = new HDKey(this.versions);

    // Private parent key -> private child key
    if (this.privateKey) {
      // ki = parse256(IL) + kpar (mod n)
      try {
        hd.privateKey = Uint8Array.from(secp256k1.privateKeyTweakAdd(this.privateKey, IL));
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
        hd.publicKey = Buffer.from(secp256k1.publicKeyTweakAdd(this.publicKey, IL, true))
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

  public fromMasterSeed(seedBuffer: Uint8Array, versions = BITCOIN_VERSIONS) {
    const I = Hmac(sha512, MASTER_SECRET)
      .update(utils.hex.fromBytes(seedBuffer))
      .digest();

    const IL = Buffer.from(I).slice(0, 32);
    const IR = Buffer.from(I).slice(32);  
    const hdkey = new HDKey(versions);

    hdkey.setChainCode(IR);
    hdkey.privateKey = Uint8Array.from(IL);
  
    return hdkey;
  }

  #hash160(buf: Buffer) {
    const hash = sha256()
      .update(buf)
      .digest();
    return ripemd160()
      .update(hash)
      .digest();
  }
}
