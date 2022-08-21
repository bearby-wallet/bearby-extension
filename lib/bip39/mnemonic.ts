import { Buffer } from 'buffer';
import sha256 from 'hash.js/lib/hash/sha/256';

import { assert } from 'lib/assert';

import { WORD_LIST } from './wordlists';
import { randomBytes } from 'lib/crypto/random';
import { pbkdf2 } from 'lib/crypto/pbkdf2';


export class MnemonicController {

  generateMnemonic(strength = 128) {
    assert(strength % 32 === 0, 'InvalidEntropy');

    return this.entropyToMnemonic(randomBytes(strength / 8));
  }

  getKey(index: number) {
    return `m/44'/22'/0'/0/${index}`; // TODO: change to Massa path.
  }

  mnemonicToSeed(mnemonic: string, password?: string): Buffer {
    const mnemonicBuffer = Buffer.from(this.#normalize(mnemonic));
    const saltBuffer = Buffer.from(this.#salt(this.#normalize(password)));

    return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64);
  }

  mnemonicToEntropy(mnemonic: string) {
    const words = this.#normalize(mnemonic).split(' ');

    assert(words.length >= 12, 'IncorrectMnemonic');
    assert(words.length % 3 === 0, 'IncorrectMnemonic');
    // convert word indices to 11 bit binary strings
    const bits = words.map((word) => {
      const index = WORD_LIST.indexOf(word);

      assert(index !== -1, 'IncorrectMnemonic');

      return this.#lpad(index.toString(2), '0', 11);
    }).join('');

    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = (entropyBits.match(/(.{1,8})/g) || [])
      .map(this.#binaryToByte);

    assert(entropyBytes.length >= 16, 'InvalidEntropy');
    assert(entropyBytes.length <= 32, 'InvalidEntropy');
    assert(entropyBytes.length % 4 === 0, 'InvalidEntropy');

    return Buffer.from(entropyBytes);
  }

  validateMnemonic(mnemonic: string) {
    try {
      this.mnemonicToEntropy(mnemonic);
    } catch (e) {
      return false;
    }
    return true;
  }

  entropyToMnemonic(entropy: Buffer | Uint8Array, wordlist = WORD_LIST) {
    const bufferEntropy = Buffer.from(entropy);

    // 128 <= ENT <= 256
    assert(bufferEntropy.length >= 16, 'InvalidEntropy');
    assert(bufferEntropy.length <= 32, 'InvalidEntropy');
    assert(bufferEntropy.length % 4 === 0, 'InvalidEntropy');

    const entropyBits = this.#bytesToBinary(bufferEntropy);
    const checksumBits = this.#deriveChecksumBits(bufferEntropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g) || [];

    assert(Boolean(chunks) || chunks.length === 0, 'InvalidEntropy');

    const words = chunks.map((binary) => {
        const index = this.#binaryToByte(binary);
        return wordlist[index];
    });

    return words.join(' ');
  }

  #bytesToBinary(bytes: Buffer) {
    return Array
      .from(bytes)
      .map((x) => this.#lpad(x.toString(2), '0', 8)).join('');
  }

  #salt(password: string) {
    return 'mnemonic' + (password || '');
  }

  #normalize(str?: string) {
    return (str || '').normalize('NFKD');
  }

  #lpad(str: string, padString: string, length: number) {
    while (str.length < length) {
        str = padString + str;
    }
    return str;
  }

  #binaryToByte(bin: string) {
    return parseInt(bin, 2);
  }

  #deriveChecksumBits(entropyBuffer: Buffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = sha256()
      .update(entropyBuffer)
      .digest();

    return this.#bytesToBinary(hash).slice(0, CS);
  }
}
