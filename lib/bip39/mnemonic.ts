import { assert } from 'lib/assert';

import { WORD_LIST } from './wordlists';
import { randomBytes } from 'lib/crypto/random';
import { pbkdf2 } from 'lib/crypto/pbkdf2';
import { sha256 } from 'lib/crypto/sha256';
import {
  INVALID_ENTROPY,
  Bip39Error,
  INCORRECT_MNEMONIC
} from './errors';
import { utils } from 'aes-js';


export class MnemonicController {

  async generateMnemonic(strength = 128) {
    assert(strength % 32 === 0, INVALID_ENTROPY, Bip39Error);

    return await this.entropyToMnemonic(randomBytes(strength / 8));
  }

  getPath(index: number) {
    return `m/44'/632'/0'/0/${index}`;
  }

  async mnemonicToSeed(mnemonic: string, password?: string) {
    const mnemonicBuffer = utils.utf8.toBytes(this.#normalize(mnemonic));
    const saltBuffer = utils.utf8.toBytes(this.#salt(this.#normalize(password)));

    return await pbkdf2(mnemonicBuffer, saltBuffer, 2048);
  }

  mnemonicToEntropy(mnemonic: string) {
    const words = this.#normalize(mnemonic).split(' ');

    assert(words.length >= 12, INCORRECT_MNEMONIC, Bip39Error);
    assert(words.length % 3 === 0, INCORRECT_MNEMONIC, Bip39Error);
    // convert word indices to 11 bit binary strings
    const bits = words.map((word) => {
      const index = WORD_LIST.indexOf(word);

      assert(index !== -1, INCORRECT_MNEMONIC, Bip39Error);

      return this.#lpad(index.toString(2), '0', 11);
    }).join('');

    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = (entropyBits.match(/(.{1,8})/g) || [])
      .map(this.#binaryToByte);

    assert(entropyBytes.length >= 16, INVALID_ENTROPY, Bip39Error);
    assert(entropyBytes.length <= 32, INVALID_ENTROPY, Bip39Error);
    assert(entropyBytes.length % 4 === 0, INVALID_ENTROPY, Bip39Error);

    return new Uint8Array(entropyBytes);
  }

  validateMnemonic(mnemonic: string) {
    try {
      this.mnemonicToEntropy(mnemonic);
    } catch (e) {
      return false;
    }
    return true;
  }

  async entropyToMnemonic(entropy: Uint8Array, wordlist = WORD_LIST) {

    // 128 <= ENT <= 256
    assert(entropy.length >= 16, INVALID_ENTROPY, Bip39Error);
    assert(entropy.length <= 32, INVALID_ENTROPY, Bip39Error);
    assert(entropy.length % 4 === 0, INVALID_ENTROPY, Bip39Error);

    const entropyBits = this.#bytesToBinary(entropy);
    const checksumBits = await this.#deriveChecksumBits(entropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g) || [];

    assert(Boolean(chunks) || chunks.length === 0, INVALID_ENTROPY, Bip39Error);

    const words = chunks.map((binary) => {
        const index = this.#binaryToByte(binary);
        return wordlist[index];
    });

    return words.join(' ');
  }

  #bytesToBinary(bytes: Uint8Array) {
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

  async #deriveChecksumBits(entropyBuffer: Uint8Array) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = await sha256(new Uint8Array(entropyBuffer));

    return this.#bytesToBinary(hash).slice(0, CS);
  }
}
