import type { Guard } from 'core/background/guard';
import type { Wallet, Account, KeyPair, Balance, AppConnection } from 'types';
import type { BadgeControl } from 'background/notifications';

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
  HARDWARE_NOT_SUPPORT_METHOD,
  ACCOUNT_NAME_MUST_UNIQUE,
  ACCOUNT_PRODUCT_ID_MUST_UNIQUE
} from './errors';
import { INVALID_BASE58_ADDRESS } from 'lib/address/errors';
import { addressFromPublicKey, isBase58Address, publicKeyBytesFromPrivateKey, pubKeyFromBytes, base58PubKeyToBytes } from 'lib/address';
import { base58PrivateKeyToBytes, isPrivateKey } from 'lib/validator';
import { TypeOf } from 'lib/type';
import { USER_VERSION_NUMBER } from 'config/common';


export class AccountController {
  static readonly field0 = 'identities';
  static readonly field1 = 'selectedAddress';

  readonly bip39 = new MnemonicController();
  readonly #guard: Guard;
  readonly #badge: BadgeControl;

  #requestPubKey?: AppConnection;
  #wallet: Wallet = {
    [AccountController.field1]: 0,
    [AccountController.field0]: []
  };

  get wallet() {
    return this.#wallet;
  }

  get requestPubKey() {
    return this.#requestPubKey;
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

  get lastIndexTracker() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Track)
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

  constructor(guard: Guard, badge: BadgeControl) {
    this.#guard = guard;
    this.#badge = badge;
  }

  async setPubKeyRequest(req?: AppConnection) {
    this.#requestPubKey = req;

    if (req) {
      await this.#badge.decrease();
      await this.#badge.increase();
    } else {
      await this.#badge.decrease();

    }
  }

  async remove(index: number) {
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

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  async sync() {
    const walletJson = await BrowserStorage.get(Fields.WALLET);

    try {
      const wallet = JSON.parse(String(walletJson));

      this.#wallet = wallet;
    } catch {
      await this.reset();
    }
  }

  async reset() {
    this.#wallet.identities = [];
    this.#wallet.selectedAddress = 0;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  async fromSeed(seed: Uint8Array, index = 0) {
    const hdKey = new HDKey();
    const path = this.bip39.getPath(index);

    await hdKey.derivePath(path, seed);

    return await hdKey.keyPair();
  }

  async addAccountFromSeed(seed: Uint8Array, name: string) {
    const index = this.lastIndexSeed;
    const pubKey = await this.fromSeed(seed, index);
    const base58 = await addressFromPublicKey(pubKey);
    const base58PubKey = await pubKeyFromBytes(pubKey.pubKey);
    const type = AccountTypes.Seed;
    const account: Account = {
      name,
      base58,
      index,
      type,
      version: pubKey.version,
      pubKey: base58PubKey,
      nft: {},
      tokens: {}
    };
    await this.#add(account);
    return account;
  }

  async addAccountFromPrivateKey(privateKey: string, name: string) {
    const index = this.lastIndexPrivKey;
    const { pubKey, base58, privKey, version } = await this.fromPrivateKey(privateKey);
    const type = AccountTypes.PrivateKey;
    const encryptedPrivateKey = this.#guard.encryptPrivateKey(privKey);
    const base58PubKey = await pubKeyFromBytes(pubKey);
    const account: Account = {
      name,
      index,
      base58,
      type,
      version,
      pubKey: base58PubKey,
      privKey: encryptedPrivateKey,
      nft: {},
      tokens: {}
    };
    await this.#add(account);
    return account;
  }

  async fromPrivateKey(privateKey: string): Promise<KeyPair> {
    const pk = await base58PrivateKeyToBytes(privateKey);

    isPrivateKey(pk.privKey);

    const pubKey = await publicKeyBytesFromPrivateKey(pk);
    const base58 = await addressFromPublicKey(pubKey);

    return {
      ...pk,
      ...pubKey,
      base58,
    };
  }

  async addAccountForTrack(base58: string, name: string) {
    assert(await isBase58Address(base58), INVALID_BASE58_ADDRESS, AccountError);

    const index = this.lastIndexTracker;
    const type = AccountTypes.Track;
    const account: Account = {
      name,
      index,
      base58,
      type,
      version: USER_VERSION_NUMBER,
      pubKey: '',
      nft: {},
      tokens: {}
    };
    await this.#add(account);
    return account;
  }

  async updateBalance(balances: Balance[]) {
    for (let index = 0; index < balances.length; index++) {
      const balance = balances[index];
      this.#wallet.identities[index].tokens = balance;
    }

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  getAccount(index: number) {
    assert(index <= this.wallet.identities.length - 1, ACCOUNT_OUT_INDEX, AccountError);
    return this.wallet.identities[index];
  }

  getImportedAccountKeys(): KeyPair[] {
    const imported = this.wallet.identities.filter(
      (acc) => acc.type === AccountTypes.PrivateKey
    );
    return imported.map((acc) => ({
      pubKey: Uint8Array.from([]),
      privKey: this.#guard.decryptPrivateKey(String(acc.privKey)),
      base58: acc.base58,
      version: 0 // TODO: change to automaticly
    }));
  }

  async updateImportedKeys(keys: KeyPair[]) {
    this.#wallet.identities = this.#wallet.identities.map((acc) => {
      if (acc.type === AccountTypes.PrivateKey) {
        const found = keys.find((key) => key.base58 === acc.base58);
        if (found) {
          acc.privKey = this.#guard.encryptPrivateKey(found.privKey);
        }
      }
      return acc;
    });

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  async getKeyPair(index = this.wallet.selectedAddress): Promise<KeyPair> {
    const account = this.wallet.identities[index];
    switch (account.type) {
      case AccountTypes.Seed:
        const seed = this.#guard.seed;
        const keyPair = await this.fromSeed(seed, account.index);
        return keyPair;
      case AccountTypes.PrivateKey:
        const encryptedPriveLey = this.selectedAccount?.privKey;
        assert(Boolean(encryptedPriveLey), ACCOUNT_NOT_FOUND, AccountError);
        const privKey = this.#guard.decryptPrivateKey(String(encryptedPriveLey));
        const version = Number(this.selectedAccount?.version);
        const pubKey = await base58PubKeyToBytes(String(this.selectedAccount?.pubKey));
        return {
          privKey,
          pubKey,
          version,
          base58: String(this.selectedAccount?.base58)
        };
    }

    throw new Error(HARDWARE_NOT_SUPPORT_METHOD);
  }

  async select(index: number) {
    assert(index < this.wallet.identities.length, ACCOUNT_OUT_INDEX, AccountError);

    this.#wallet.selectedAddress = index;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );

    return this.selectedAccount;
  }

  async changeAccountName(index: number, name: string) {
    this.#wallet.identities[index].name = name;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  async #add(account: Account) {
    await this.#checkAccount(account);

    this.#wallet
      .identities
      .push(account);
    this.#wallet
      .selectedAddress = this.wallet.identities.length - 1;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );

    return this.wallet;
  }

  async #checkAccount(account: Account) {
    await this.sync();

    const isUniqueAddress = this.wallet.identities.some(
      (acc) => (acc.base58 === account.base58)
    );
    const isUniqueName = this.wallet.identities.some(
      (acc) => (acc.name === account.name)
    );
    const isUniqueProductId = this.wallet.identities.some(
      (acc) => (!TypeOf.isUndefined(acc.productId) &&
        !TypeOf.isUndefined(account.productId) &&
        acc.productId === account.productId)
    );

    assert(!isUniqueAddress, ACCOUNT_MUST_UNIQUE, AccountError);
    assert(!isUniqueName, ACCOUNT_NAME_MUST_UNIQUE, AccountError);
    assert(!isUniqueProductId, ACCOUNT_PRODUCT_ID_MUST_UNIQUE, AccountError);
  }
}
