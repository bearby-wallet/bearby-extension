import secp256k1 from 'secp256k1/elliptic';

import { assert } from 'lib/assert';
import { INVALID_PRIVATE_KEY } from './errors';


export const isPrivateKey = (privateKey: Uint8Array) => {
  assert(secp256k1.privateKeyVerify(privateKey), INVALID_PRIVATE_KEY);
};
