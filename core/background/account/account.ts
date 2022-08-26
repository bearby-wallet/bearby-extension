import type { Guard } from 'core/background/guard';
import type { Wallet, Account, KeyPair } from 'types';

import { utils } from 'aes-js';

import { MnemonicController, HDKey } from 'lib/bip39';
import { AccountTypes } from 'config/account-type';
import { BrowserStorage, buildObject } from 'lib/storage';
import { assert } from 'lib/assert';
import { Fields } from 'config/fields';
import {
  AccountError,
  NIL_ACCOUNT,
  INCORRECT_ACCOUNT,
  ACCOUNT_MUST_UNIQUE,
  ACCOUNT_OUT_INDEX,
  ACCOUNT_NOT_FOUND,
  HARDWARE_NOT_SUPPORT_METHOD
} from './errors';
import { addressFromPublicKey, publicKeyBytesFromPrivateKey } from 'lib/address';
import { isPrivateKey } from 'lib/validator';


export class AccountController {
  static readonly field0 = 'identities';
  static readonly field1 = 'selectedAddress';

  readonly bip39 = new MnemonicController();

  readonly #hdKey = new HDKey();

  readonly #guard: Guard;

  #wallet: Wallet = {
    [AccountController.field1]: 0,
    [AccountController.field0]: []
  };

  get wallet() {
    return this.#wallet;
  }

  get selectedAccount(): undefined | Account {
    if (this.wallet.identities.length === 0) {
      return;
    }
    if (!this.wallet.identities[this.wallet.selectedAddress]) {
      return;
    }
    return this.wallet.identities[this.wallet.selectedAddress];
  }

  get lastIndexPrivKey() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.PrivateKey)
      .length;
  }

  get lastIndexSeed() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Seed)
      .length;
  }

  get lastIndexLedger() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Ledger)
      .length;
  }

  get lastIndexTrezor() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Trezor)
      .length;
  }

  constructor(guard: Guard) {
    this.#guard = guard;
  }

  public async remove(index: number) {
    const account = this.wallet.identities[index];

    assert(Boolean(account), NIL_ACCOUNT, AccountError);
    assert(
      !(account.index === 0 && account.type === AccountTypes.Seed),
      INCORRECT_ACCOUNT,
      AccountError
    );

    delete this.#wallet.identities[index];

    this.#wallet.identities = this.#wallet.identities.filter(Boolean);

    if (this.wallet.selectedAddress === index) {
      this.wallet.selectedAddress -= 1;
    }

    await this.#trigger();
    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  public async sync() {
    const walletJson = await BrowserStorage.get(Fields.WALLET);

    try {
      const wallet = JSON.parse(String(walletJson));

      this.#wallet = wallet;
    } catch (err) {
      console.error(err);
    }
  }

  public async reset() {
    this.#wallet.identities = [];
    this.#wallet.selectedAddress = 0;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  public fromSeed(seed: Uint8Array, index = 0) {
    const path = this.bip39.getPath(index);
    const hdKey = this.#hdKey.fromMasterSeed(seed);
    const childKey = hdKey.derive(path);

    return childKey.keyPair;
  }

  public async addAccountFromSeed(seed: Uint8Array, name: string) {
    const index = this.lastIndexSeed;
    const { pubKey } = this.fromSeed(seed, index);
    const base58 = addressFromPublicKey(pubKey);
    const type = AccountTypes.Seed;
    const account: Account = {
      name,
      base58,
      index,
      type,
      pubKey: utils.hex.fromBytes(pubKey),
      nft: {},
      tokens: {}
    };
    await this.#add(account);
    return account;
  }

  public fromPrivateKey(privateKey: string): KeyPair {
    isPrivateKey(privateKey);

    const bufPrivateKey = utils.hex.toBytes(privateKey);

    const pubKey = publicKeyBytesFromPrivateKey(bufPrivateKey);
    const base58 = addressFromPublicKey(pubKey);

    return {
      pubKey,
      base58,
      privKey: bufPrivateKey
    };
  }

  getAccount(index: number) {
    assert(index <= this.wallet.identities.length - 1, ACCOUNT_OUT_INDEX);
    return this.wallet.identities[index];
  }

  getKeyPair(index = this.wallet.selectedAddress): KeyPair {
    const account = this.wallet.identities[index];
    switch (account.type) {
      case AccountTypes.Seed:
        const seed = this.#guard.seed;
        const keyPair = this.fromSeed(seed, account.index);
        return keyPair;
      case AccountTypes.PrivateKey:
        const encryptedPriveLey = this.selectedAccount?.privKey;
        assert(Boolean(encryptedPriveLey), ACCOUNT_NOT_FOUND, AccountError);
        const privateKey = this.#guard.decryptPrivateKey(String(encryptedPriveLey));
        return {
          pubKey: utils.hex.toBytes(String(this.selectedAccount?.pubKey)),
          privKey: privateKey,
          base58: String(this.selectedAccount?.base58)
        };
    }

    throw new Error(HARDWARE_NOT_SUPPORT_METHOD);
  }

  async #add(account: Account) {
    await this.#checkAccount(account);

    this.#wallet
      .identities
      .push(account);
    this.#wallet
      .selectedAddress = this.wallet.identities.length - 1;

    await this.#trigger();
    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );

    return this.wallet;
  }

  async #checkAccount(account: Account) {
    await this.sync();

    const isUnique = this.wallet.identities.some(
      (acc) => (acc.base58 === account.base58)
    );

    assert(!isUnique, ACCOUNT_MUST_UNIQUE, AccountError);
  }

  async #trigger() {}
}
