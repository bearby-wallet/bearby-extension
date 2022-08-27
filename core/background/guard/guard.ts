import { toByteArray, fromByteArray } from 'base64-js';
import { utils } from 'aes-js';
import { sha256 } from 'lib/crypto/sha256';

import {
  GuardError,
  WALLET_NOT_READY,
  WALLET_NOT_SYNC,
  INCORRECT_PASSWORD,
  WALLET_NOT_ENABLED
} from './error';
import { Cipher } from 'lib/crypto/aes';
import { MnemonicController } from 'lib/bip39';
import { assert } from 'lib/assert';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { Fields } from 'config/fields';
import { TIME_BEFORE_LOCK } from 'config/common';
import { isPrivateKey } from 'lib/validator';


export class Guard {
  // hash of the password.
  #hash = new WeakMap<Guard, Uint8Array>();

  // this property is responsible for control session.
  #isEnable = false;

  // this property is responsible for control wallet.
  #isReady = false;

  #privateExtendedKey?: Uint8Array;
  // Seed phase storage in encrypted.
  #encryptMnemonic?: Uint8Array;

  // Current time + some hours.
  #endSession = new Date(-1);
  #time = TIME_BEFORE_LOCK;

  get seed() {
    this.checkSession();

    const session = this.#hash.get(this) as Uint8Array;
    const decryptSeedBytes = Cipher.decrypt(
      this.#privateExtendedKey as Uint8Array,
      session
    );

    return decryptSeedBytes;
  }

  get lockTime() {
    return Number(this.#time);
  }

  get isEnable() {
    const now = new Date().getTime();
    const timeDifference = this.#endSession.getTime() - now;

    return timeDifference > 0 && this.#isEnable;
  }

  get isReady() {
    return this.#isReady;
  }

  get encryptedMnemonic() {
    return this.#encryptMnemonic;
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.VAULT,
      Fields.LOCK_TIME
    ) as StorageKeyValue;

    if (data && data[Fields.VAULT]) {
      this.#encryptMnemonic = toByteArray(data[Fields.VAULT]);
      this.#isReady = Boolean(this.#encryptMnemonic);
    }

    if (data[Fields.LOCK_TIME]) {
      this.#time = Number(data[Fields.LOCK_TIME]);
    } else {
      await BrowserStorage.set(
        buildObject(Fields.LOCK_TIME, String(TIME_BEFORE_LOCK))
      );
    }
  }

  async unlock(password: string) {
    assert(this.isReady, WALLET_NOT_READY, GuardError);

    try {
      assert(Boolean(this.#encryptMnemonic), WALLET_NOT_SYNC, GuardError);

      const mnemonicController = new MnemonicController();
      const passwordBytes = utils.utf8.toBytes(password);
      const hash = await sha256(passwordBytes);
      const mnemonicBytes = Cipher.decrypt(this.#encryptMnemonic as Uint8Array, hash);
      const mnemonic = utils.utf8.fromBytes(mnemonicBytes);

      assert(mnemonicController.validateMnemonic(mnemonic), INCORRECT_PASSWORD, GuardError);

      const seed = mnemonicController.mnemonicToSeed(mnemonic);

      this.#privateExtendedKey = Cipher.encrypt(seed, hash);

      this.#isEnable = true;
      this.#updateSession();
      this.#hash.set(this, hash);
    } catch (err) {
      this.logout();
      throw new GuardError(INCORRECT_PASSWORD);
    }
  }

  async setupVault(mnemonic: string, password: string, usePassword = false) {
    const mnemonicBuf = utils.utf8.toBytes(mnemonic);
    const passwordBytes = utils.utf8.toBytes(password);
    const hash = await sha256(passwordBytes);
    const seed = new MnemonicController().mnemonicToSeed(
      mnemonic,
      usePassword ? password : undefined
    );

    this.#encryptMnemonic = Cipher.encrypt(mnemonicBuf, hash);
    this.#privateExtendedKey = Cipher.encrypt(seed, hash);

    this.#isReady = true;
    this.#isEnable = true;
    this.#updateSession();
    this.#hash.set(this, hash);

    await BrowserStorage.set(
      buildObject(Fields.VAULT, fromByteArray(this.#encryptMnemonic))
    );
  }

  encryptPrivateKey(privKey: Uint8Array) {
    isPrivateKey(privKey);

    const hash = this.#hash.get(this) as Uint8Array;
    const encrypted = Cipher.encrypt(privKey, hash);

    return fromByteArray(encrypted);
  }

  decryptPrivateKey(content: string) {
    const hash = this.#hash.get(this) as Uint8Array;
    const bytes = Cipher.decrypt(toByteArray(content), hash);

    isPrivateKey(bytes);

    return bytes;
  }

  checkSession() {
    assert(this.#isReady, WALLET_NOT_READY, GuardError);
    assert(this.#isEnable, WALLET_NOT_ENABLED, GuardError);
  }

  async logout() {
    this.#isEnable = false;
    this.#endSession = new Date(-1);

    this.#hash.delete(this);
  }

  async #updateSession() {
    const now = new Date().getTime();
    const h = Number(this.#time);
    const newSession = new Date();

    newSession.setTime(now + (h * 60 * 60 * 1000));

    this.#endSession = newSession;
  }
}
