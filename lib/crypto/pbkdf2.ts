import { TypeOf } from 'lib/type';

import { Encoding } from 'config/encoding';
import Hmac from 'hash.js/lib/hash/hmac.js';
import sha512 from 'hash.js/lib/hash/sha/512';


const MAX_ALLOC = Math.pow(2, 30) - 1;

function toBuffer(thing: Buffer | string, name: string, encoding = Encoding.Utf8) {
  if (Buffer.isBuffer(thing)) {
    return thing;
  } else if (TypeOf.isString(thing)) {
    return Buffer.from(thing, encoding);
  } else if (ArrayBuffer.isView(thing)) {
    return Buffer.from(thing.buffer);
  } else {
    throw new TypeError(name + ' must be a string, a Buffer, a typed array or a DataView')
  }
}

function checkParameters(iterations: number, keylen: number) {
  if (!TypeOf.isNumber(iterations)) {
    throw new TypeError('Iterations not a number');
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations');
  }

  if (!TypeOf.isNumber(keylen)) {
    throw new TypeError('Key length not a number');
  }

  if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen) {
    throw new TypeError('Bad key length');
  }
}


export function pbkdf2(password: string | Buffer, salt: string | Buffer, iterations: number, keylen: number) {
  checkParameters(iterations, keylen);
  
  const passwordBytes = toBuffer(password, 'Password');
  const saltBytes = toBuffer(salt, 'Salt');

  const DK = Buffer.allocUnsafe(keylen);
  const block1 = Buffer.allocUnsafe(saltBytes.length + 4);

  saltBytes.copy(block1, 0, 0, saltBytes.length);

  let destPos = 0;
  const hLen = 64;
  const l = Math.ceil(keylen / hLen);

  for (let i = 1; i <= l; i++) {
    block1.writeUInt32BE(i, saltBytes.length);

    const T = Buffer.from(
      new Hmac(sha512, passwordBytes).update(block1).digest()
    );
    let U = T;

    for (let j = 1; j < iterations; j++) {
      U = new Hmac(sha512, passwordBytes).update(U).digest();

      for (let k = 0; k < hLen; k++) T[k] ^= U[k];
    }

    T.copy(DK, destPos);
    destPos += hLen;
  }

  return DK;
}
