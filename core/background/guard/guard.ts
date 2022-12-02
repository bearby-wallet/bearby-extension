import { toByteArray, fromByteArray } from 'base64-js';
import { utils } from 'aes-js';
import { sha256 } from 'lib/crypto/sha256';

import {
  GuardError,
  WALLET_NOT_READY,
  WALLET_NOT_SYNC,
  INCORRECT_PASSWORD,
  WALLET_NOT_ENABLED,
  TIMER_MUST_BE_INT,
  INCORRECT_CONFIG_PARAMS
} from './error';
import { Cipher } from 'lib/crypto/aes';
import { MnemonicController } from 'lib/bip39';
import { assert } from 'lib/assert';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { Fields } from 'config/fields';
import { TIME_BEFORE_LOCK } from 'config/common';
import { isPrivateKey } from 'lib/validator';
import { TypeOf } from 'lib/type';
import { ShaAlgorithms } from 'config/sha-algorithms';
import { pbkdf2 } from 'lib/crypto/pbkdf2';
import { EXTENSION_ID } from 'lib/runtime/id';


export class Guard {
  // hash of the password.
  #hash = new WeakMap<Guard, Uint8Array>();
  #algorithm = ShaAlgorithms.sha256;
  #iteractions = 0;

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

  get state() {
    return {
      isEnable: this.isEnable,
      isReady: this.isReady,
      iteractions: this.#iteractions,
      algorithm: this.#algorithm
    };
  }

  get encryptedMnemonic() {
    return this.#encryptMnemonic;
  }

  async sync() {
    const data = await BrowserStorage.get(
      Fields.VAULT,
      Fields.LOCK_TIME,
      Fields.GUARD_CONFIG
    ) as StorageKeyValue;

    if (data && data[Fields.VAULT]) {
      this.#encryptMnemonic = toByteArray(data[Fields.VAULT]);
      this.#isReady = Boolean(this.#encryptMnemonic);
    }

    if (data && data[Fields.GUARD_CONFIG]) {
      const [algorithm, iteractions] = String(data[Fields.GUARD_CONFIG]).split(':');

      if (algorithm === ShaAlgorithms.sha256 || algorithm === ShaAlgorithms.Sha512) {
        this.#algorithm = algorithm;
      }

      if (!isNaN(Number(iteractions))) {
        this.#iteractions = Number(iteractions);
      }
    }

    if (data[Fields.LOCK_TIME]) {
      this.#time = Number(data[Fields.LOCK_TIME]);
    } else {
      await BrowserStorage.set(
        buildObject(Fields.LOCK_TIME, String(TIME_BEFORE_LOCK))
      );
    }
  }

  async setGuardConfig(algorithm: string, iteractions: number) {
    assert(
      algorithm === ShaAlgorithms.sha256 || algorithm === ShaAlgorithms.Sha512,
      INCORRECT_CONFIG_PARAMS,
      GuardError
    );
    assert(iteractions >= 0, INCORRECT_CONFIG_PARAMS, GuardError);
    assert(iteractions % 2 === 0, INCORRECT_CONFIG_PARAMS, GuardError);

    this.#algorithm = algorithm as ShaAlgorithms;
    this.#iteractions = iteractions;

    const newConfig = `${algorithm}:${iteractions}`;

    await BrowserStorage.set(
      buildObject(Fields.GUARD_CONFIG, newConfig)
    );
  }

  async setLogOutTimer(timer: number) {
    assert(TypeOf.isInt(timer), TIMER_MUST_BE_INT, GuardError);
    assert(timer > 0, TIMER_MUST_BE_INT, GuardError);

    this.#time = timer;

    await BrowserStorage.set(
      buildObject(Fields.LOCK_TIME, String(this.lockTime))
    );
  }

  async exportMnemonic(password: string) {
    assert(this.isReady, WALLET_NOT_READY, GuardError);

    try {
      assert(Boolean(this.#encryptMnemonic), WALLET_NOT_SYNC, GuardError);

      const hash = await this.#getKeyring(password);
      const mnemonicBytes = Cipher.decrypt(this.#encryptMnemonic as Uint8Array, hash);
      
      return utils.utf8.fromBytes(mnemonicBytes);
    } catch (err) {
      this.logout();
      throw new GuardError(INCORRECT_PASSWORD);
    }
  }

  async unlock(password: string) {
    assert(this.isReady, WALLET_NOT_READY, GuardError);

    try {
      assert(Boolean(this.#encryptMnemonic), WALLET_NOT_SYNC, GuardError);

      const mnemonicController = new MnemonicController();
      const hash = await this.#getKeyring(password);
      const mnemonicBytes = Cipher.decrypt(this.#encryptMnemonic as Uint8Array, hash);
      const mnemonic = utils.utf8.fromBytes(mnemonicBytes);

      assert(mnemonicController.validateMnemonic(mnemonic), INCORRECT_PASSWORD, GuardError);

      const seed = await mnemonicController.mnemonicToSeed(mnemonic);

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
    const hash = await this.#getKeyring(password);
    const seed = await new MnemonicController().mnemonicToSeed(
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

  async #getKeyring(password: string) {
    const salt = utils.utf8.toBytes(EXTENSION_ID);
    const passwordBytes = utils.utf8.toBytes(password);

    if (this.#algorithm === ShaAlgorithms.sha256 && this.#iteractions === 0) {
      return await sha256(passwordBytes);
    }

    const key = await pbkdf2(passwordBytes, salt, this.#iteractions);

    return await sha256(key);
  }
}
