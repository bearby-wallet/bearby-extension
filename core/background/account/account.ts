import type { Guard } from 'core/background/guard';
import type { Wallet, Account } from 'types';

import { MnemonicController, HDKey } from 'lib/bip39';
import { AccountTypes } from 'config/account-type';


export class AccountController {
  public static readonly field0 = 'identities';
  public static readonly field1 = 'selectedAddress';

  public readonly bip39 = new MnemonicController();

  readonly #hdKey = new HDKey();

  readonly #guard: Guard;

  #wallet: Wallet = {
    [AccountController.field1]: 0,
    [AccountController.field0]: []
  };

  public get wallet() {
    return this.#wallet;
  }

  public get selectedAccount(): undefined | Account {
    if (this.wallet.identities.length === 0) {
      return;
    }
    if (!this.wallet.identities[this.wallet.selectedAddress]) {
      return;
    }
    return this.wallet.identities[this.wallet.selectedAddress];
  }

  public get lastIndexPrivKey() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.PrivateKey)
      .length;
  }

  public get lastIndexSeed() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Seed)
      .length;
  }

  public get lastIndexLedger() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Ledger)
      .length;
  }

  public get lastIndexTrezor() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Trezor)
      .length;
  }

  constructor(guard: Guard) {
    this.#guard = guard;
  }
}
