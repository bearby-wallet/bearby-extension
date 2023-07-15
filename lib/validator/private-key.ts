import type { PrivateKey } from 'types/account';

import { assert } from 'lib/assert';
import { INVALID_PRIVATE_KEY } from './errors';
import { VarintDecode, VarintEncode } from 'lib/varint';
import { SECRET_KEY_PREFIX, VERSION_NUMBER } from 'config/common';
import { base58Decode, base58Encode } from 'lib/address';
import { INVALID_PREFIX } from 'lib/address/errors';


export const isPrivateKey = (privateKey: Uint8Array) => {
  assert(Uint8Array.from(privateKey).length === 32, INVALID_PRIVATE_KEY);
};

export async function privateKeyBytesToBase58(bytes: Uint8Array) {
  const version = Uint8Array.from(
    new VarintEncode().encode(VERSION_NUMBER)
  );
  const encoded = await base58Encode(Uint8Array.from([...version, ...bytes]))
  return SECRET_KEY_PREFIX + encoded;
}

export async function base58PrivateKeyToBytes(base58PrivateKey: string): Promise<PrivateKey> {
  assert(base58PrivateKey[0] === SECRET_KEY_PREFIX, INVALID_PREFIX);

  const outPrefix = base58PrivateKey.slice(1);
  const bytes = await base58Decode(outPrefix);
  const privKey = bytes.slice(1);
  const version = new VarintDecode().decode(bytes.slice(0, 1));

  return {
    privKey,
    version
  };
}
