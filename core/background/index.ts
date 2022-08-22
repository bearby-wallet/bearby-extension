// import { KeyChain } from 'lib/crypto/aes';

// // import { utils } from 'aes-js';


// // const hash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
// // const test = 'encrypt me';

// // const bytes = KeyChain.encrypt(test, hash);
// // const encryptedHash = utils.hex.fromBytes(bytes);
// // console.log(`encryptedHash: ${encryptedHash}`);
// // const decrypted = KeyChain.decrypt(encryptedHash, hash);
// // console.log(`decrypted: ${decrypted}`);


import { randomBytes } from 'lib/crypto/random';
// import { Hmac } from 'lib/crypto/hmac';

// import { MnemonicController } from '../../lib/bip39/mnemonic';
// import { HDKey } from '../../lib/bip39/hd-key';

// const mnemonic = new MnemonicController();
// const bytes = [
//   156,  25, 160,  35, 134,  94, 109, 106,
//   151,  15,  55, 148, 220,  49,  58, 129,
//    40,   5, 101, 125,  27, 198, 149, 100,
//   245, 250, 160, 237, 156, 165,  75, 237
// ];

// const words = mnemonic.entropyToMnemonic(Buffer.from(bytes));
// const seed = mnemonic.mnemonicToSeed(words);
// const hdkey = new HDKey().fromMasterSeed(seed);
// const childKey = hdkey.derive(mnemonic.getKey(0));

// console.log(words);
// console.log('seed', seed.toString('hex'));
// console.log({
//   privateKey: childKey.privateKey.toString('hex'),
//   publicKey: childKey.publicKey.toString('hex')
// });


// import { BaseError } from 'lib/error';

// class TestError extends BaseError {
//   name = 'TestError'
// }


// console.log(new TestError('test').serialize());

// import sha256 from 'hash.js/lib/hash/sha/256';
// import { utils } from 'aes-js';
// import { Cipher } from 'lib/crypto/aes';

// const hash = new Uint8Array(sha256().update('password').digest());
// const content = utils.utf8.toBytes('encrypt me');
// const encrypted = Cipher.encrypt(content, hash);
// console.log(encrypted);
// const decrypted = Cipher.decrypt(encrypted, hash);
// console.log(utils.utf8.fromBytes(decrypted));

