import { assert } from "lib/assert";

import { WORD_LIST } from "./wordlists";
import { randomBytes } from "lib/crypto/random";
import { pbkdf2 } from "lib/crypto/pbkdf2";
import { sha256 } from "lib/crypto/sha256";
import { INVALID_ENTROPY, Bip39Error, INCORRECT_MNEMONIC } from "./errors";
import { utils } from "aes-js";

export class MnemonicController {
  async generateMnemonic(size = 12) {
    assert(size >= 12 && size <= 24, INVALID_ENTROPY, Bip39Error);
    let entropy = randomBytes((size / 3) * 4);

    let words = await this.entropyToMnemonic(entropy, size);

    return words;
  }

  getPath(index: number) {
    return `m/44'/632'/0'/0'/${index}'`;
  }

  async mnemonicToSeed(mnemonic: string, password?: string) {
    const mnemonicBuffer = utils.utf8.toBytes(this.#normalize(mnemonic));
    const saltBuffer = utils.utf8.toBytes(
      this.#salt(this.#normalize(password)),
    );

    return await pbkdf2(mnemonicBuffer, saltBuffer, 2048);
  }

  async entropyToMnemonic(entropy: Uint8Array, size: number) {
    const MAX_ENTROPY_BITS = 256;
    const MIN_ENTROPY_BITS = 128;
    const MAX_CHECKSUM_BITS = 8;
    const MAX_NB_WORDS = size;

    let nbBytes = entropy.length;
    let nbBits = nbBytes * 8;

    if (nbBits % 32 !== 0) {
      throw new Bip39Error(`Bip39BadEntropyBitCount: ${nbBits}`);
    }
    if (nbBits < MIN_ENTROPY_BITS || nbBits > MAX_ENTROPY_BITS) {
      throw new Bip39Error(`Bip39BadEntropyBitCount: ${nbBits}`);
    }

    const check = await sha256(new Uint8Array(entropy));

    let bits = new Array(MAX_ENTROPY_BITS + MAX_CHECKSUM_BITS).fill(false);
    for (let i = 0; i < nbBytes; i++) {
      for (let j = 0; j < 8; j++) {
        bits[i * 8 + j] = (entropy[i] & (1 << (7 - j))) > 0;
      }
    }
    for (let i = 0; i < nbBytes / 4; i++) {
      bits[8 * nbBytes + i] = (check[i / 8] & (1 << (7 - (i % 8)))) > 0;
    }

    let words = new Array(MAX_NB_WORDS).fill(Number.MAX_SAFE_INTEGER);
    let nbWords = (nbBytes * 3) / 4;
    for (let i = 0; i < nbWords; i++) {
      let idx = 0;
      for (let j = 0; j < 11; j++) {
        if (bits[i * 11 + j]) {
          idx += 1 << (10 - j);
        }
      }
      words[i] = idx;
    }
    let indicators = words.map((i) => WORD_LIST[i]);

    return indicators;
  }

  mnemonicToEntropy(mnemonic: string) {
    const words = this.#normalize(mnemonic).split(" ");

    assert(words.length >= 12, INCORRECT_MNEMONIC, Bip39Error);
    assert(words.length % 3 === 0, INCORRECT_MNEMONIC, Bip39Error);
    // convert word indices to 11 bit binary strings
    const bits = words
      .map((word) => {
        const index = WORD_LIST.indexOf(word);

        assert(index !== -1, INCORRECT_MNEMONIC, Bip39Error);

        return this.#lpad(index.toString(2), "0", 11);
      })
      .join("");

    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = (entropyBits.match(/(.{1,8})/g) || []).map(
      this.#binaryToByte,
    );

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

  #salt(password: string) {
    return "mnemonic" + (password || "");
  }

  #normalize(str?: string) {
    return (str || "").normalize("NFKD");
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
}
