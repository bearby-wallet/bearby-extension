import { KeyChain } from 'lib/crypto/aes';

// import { utils } from 'aes-js';


// const hash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
// const test = 'encrypt me';

// const bytes = KeyChain.encrypt(test, hash);
// const encryptedHash = utils.hex.fromBytes(bytes);
// console.log(`encryptedHash: ${encryptedHash}`);
// const decrypted = KeyChain.decrypt(encryptedHash, hash);
// console.log(`decrypted: ${decrypted}`);


import { randomBytes } from 'lib/crypto/random';
import { Hmac } from 'lib/crypto/hmac';

import { MnemonicController } from './bip39/mnemonic';

const mnemonic = new MnemonicController();
const bytes = [
  156,  25, 160,  35, 134,  94, 109, 106,
  151,  15,  55, 148, 220,  49,  58, 129,
   40,   5, 101, 125,  27, 198, 149, 100,
  245, 250, 160, 237, 156, 165,  75, 237
];

const words = mnemonic.entropyToMnemonic(Buffer.from(bytes));

console.log(words);
console.log(mnemonic.mnemonicToEntropy(words));
console.log(mnemonic.mnemonicToSeed(words).toString('hex'));
