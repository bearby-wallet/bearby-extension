import { Buffer } from 'buffer';

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


export class MnemonicController {

  async generateMnemonic(strength = 128) {
    assert(strength % 32 === 0, INVALID_ENTROPY, Bip39Error);

    return await this.entropyToMnemonic(randomBytes(strength / 8));
  }

  getPath(index: number) {
    return `m/44'/632'/0'/0/${index}`;
  }

  mnemonicToSeed(mnemonic: string, password?: string): Buffer {
    const mnemonicBuffer = Buffer.from(this.#normalize(mnemonic));
    const saltBuffer = Buffer.from(this.#salt(this.#normalize(password)));

    return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64);
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

  async entropyToMnemonic(entropy: Buffer | Uint8Array, wordlist = WORD_LIST) {
    const bufferEntropy = Buffer.from(entropy);

    // 128 <= ENT <= 256
    assert(bufferEntropy.length >= 16, INVALID_ENTROPY, Bip39Error);
    assert(bufferEntropy.length <= 32, INVALID_ENTROPY, Bip39Error);
    assert(bufferEntropy.length % 4 === 0, INVALID_ENTROPY, Bip39Error);

    const entropyBits = this.#bytesToBinary(bufferEntropy);
    const checksumBits = await this.#deriveChecksumBits(bufferEntropy);
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

  async #deriveChecksumBits(entropyBuffer: Buffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = await sha256(entropyBuffer);

    return this.#bytesToBinary(hash).slice(0, CS);
  }
}
