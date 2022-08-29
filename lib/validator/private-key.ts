import { assert } from 'lib/assert';
import { INVALID_PRIVATE_KEY } from './errors';


export const isPrivateKey = (privateKey: Uint8Array) => {
  assert(Uint8Array.from(privateKey).length === 32, INVALID_PRIVATE_KEY);
};
