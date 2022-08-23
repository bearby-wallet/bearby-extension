import type { Guard } from 'core/background/guard';
import type { Wallet, Account } from 'types';

import { MnemonicController, HDKey } from 'lib/bip39';
import { AccountTypes } from 'config/account-type';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { assert } from 'lib/assert';
import { Fields } from 'config/fields';
import {
  AccountError,
  NIL_ACCOUNT,
  INCORRECT_ACCOUNT
} from './errors';
import { Buffer } from 'buffer';


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

  async #trigger() {}
}
