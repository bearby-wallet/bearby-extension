import secp256k1 from 'secp256k1/elliptic';

import { isByteString } from './hex';
import { assert } from 'lib/assert';
import { INVALID_PRIVATE_KEY } from './errors';


export const isPrivateKey = (privateKey: string) => {
  assert(
    secp256k1.privateKeyVerify(privateKey) && isByteString(privateKey, 64),
    INVALID_PRIVATE_KEY
  );
};
