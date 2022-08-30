import { assert } from 'lib/assert';
import { INVALID_PRIVATE_KEY } from './errors';
import { VarintEncode } from 'lib/varint';
import { SECRET_KEY_PREFIX, VERSION_NUMBER } from 'config/common';
import { base58Encode } from 'lib/address';


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
