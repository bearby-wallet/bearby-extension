import blake3 from 'blake3-js';
import * as nacl from 'tweetnacl/nacl-fast.js';
import { sha256 } from 'lib/crypto/sha256';

import { base58ToBinary, binaryToBase58 } from 'lib/crypto/base58';
import { assert } from 'lib/assert';
import { INVALID_CHECKSUM } from './errors';
import { ADDRESS_PREFIX, PUBLIC_KEY_PREFIX, VERSION_NUMBER } from 'config/common';
import { VarintEncode } from 'lib/varint';
import { utils } from 'aes-js';


async function encode(data: Uint8Array, prefix = '00') {
  const bufPrefix = utils.hex.toBytes(prefix);
  let hash = new Uint8Array([...bufPrefix, ...data]);

  hash = await sha256(hash);
  hash = await sha256(hash)
  hash = new Uint8Array([...bufPrefix, ...data,  ...hash.slice(0, 4)]);

  return binaryToBase58(hash);
}

async function decode(content: string) {
  const bytes = base58ToBinary(content);

  const prefix = bytes.slice(0, 1);
  const data = bytes.slice(1, -4);
  let hash = new Uint8Array([...prefix, ...data]);

  hash = await sha256(hash);
  hash = await sha256(hash);

  bytes.slice(-4).forEach((check, index) => {
    assert(check === hash[index], INVALID_CHECKSUM);
  });

  return {
    prefix,
    data
  };
}


export async function base58Encode(data: Uint8Array): Promise<string> {
  return await encode(data.slice(1), data[0].toString(16).padStart(2, "0"));
}

export async function base58Decode(data: string): Promise<Uint8Array> {
  const decoded = await decode(data);

  return new Uint8Array([...decoded.prefix, ...decoded.data]);
}

export async function addressFromPublicKey(publicKey: Uint8Array) {
  const version = new VarintEncode().encode(VERSION_NUMBER);
  const pubKeyHash = utils.hex.toBytes(
    blake3.newRegular().update(publicKey).finalize()
  );

  return ADDRESS_PREFIX + await base58Encode(Uint8Array.from(
    [...version, ...pubKeyHash]
  ));
}

export async function isBase58Address(address: string) {
  try {
    if (address[0] !== ADDRESS_PREFIX) {
      return false;
    }

    const bytes = await base58Decode(address.slice(1));

    if (bytes.length !== 33) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function publicKeyBytesFromPrivateKey(privateKey: Uint8Array): Uint8Array {
  const keyPair = nacl.sign.keyPair.fromSeed(privateKey);

  return keyPair.secretKey.subarray(32);
};

export async function pubKeyFromBytes(pubKey: Uint8Array) {
  const version = new VarintEncode().encode(VERSION_NUMBER);
  const base58 = await base58Encode(Uint8Array.from([
    ...version,
    ...pubKey
  ]));

  return PUBLIC_KEY_PREFIX + base58;
}
