import type { Balance, Token } from 'types';
import type { MassaControl } from 'background/provider';
import type { NetworkControl } from 'background/network';
import type { AccountController } from 'background/account';

import { ROLL_ADDRESS, ZERO_ADDRESS } from 'config/common';
import { NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';
import { TypeOf } from 'lib/type';
import { assert } from 'lib/assert';
import { TokenError } from './errors';


const [mainnet, testnet, custom] = NETWORK_KEYS;

export const XMA = {
  decimals: 9,
  rate: 1,
  name: 'Massa',
  symbol: 'XMA',
  base58: ZERO_ADDRESS
};
export const ROLL = {
  decimals: 0,
  rate: 0,
  name: 'Massa Rolls',
  symbol: 'ROLL',
  base58: ROLL_ADDRESS
};

const INIT = {
  [mainnet]: [XMA, ROLL],
  [testnet]: [XMA, ROLL],
  [custom]: [XMA, ROLL]
};

export class TokenControl {
  readonly #netwrok: NetworkControl;
  readonly #massa: MassaControl;
  readonly #account: AccountController;

  #identities: Token[] = [];

  get identities() {
    return this.#identities;
  }

  get field() {
    return `${Fields.TOKENS}/${this.#netwrok.selected}`;
  }

  constructor(
    netwrok: NetworkControl,
    massa: MassaControl,
    account: AccountController
  ) {
    this.#account = account;
    this.#netwrok = netwrok;
    this.#massa = massa;
  }

  async getBalances() {
    const addresses = this.#account.wallet.identities.map((acc) => acc.base58);
    const [resonses] = await this.#massa.getAddresses(...addresses);

    const balances: Balance[] = [];

    if (resonses.result) {
      for (let index = 0; index < resonses.result.length; index++) {
        const resonse = resonses.result[index];
  
        balances.push({
          [XMA.base58]: {
            final: resonse.ledger_info.final_ledger_info.balance,
            candidate: resonse.ledger_info.candidate_ledger_info.balance,
            locked: resonse.ledger_info.locked_balance
          },
          [ROLL.base58]: {
            final: String(resonse.rolls.final_rolls),
            candidate: String(resonse.rolls.candidate_rolls),
            locked: String(resonse.rolls.active_rolls)
          }
        });
      }
    } else if (resonses.error) {
      throw new TokenError(String(resonses.error));
    }

    return balances;
  }

  async sync() {
    const jsonList = await BrowserStorage.get(this.field);

    try {
      const list = JSON.parse(String(jsonList));

      if (!list || !TypeOf.isArray(list)) {
        return this.reset();
      }

      if (list.length < this.#identities.length) {
        return this.reset();
      }

      this.#identities = list;
    } catch {
      await this.reset();
    }
  }

  async reset() {
    const mainnetField = `${Fields.TOKENS}/${mainnet}`;
    const testnetField = `${Fields.TOKENS}/${testnet}`;
    const customField = `${Fields.TOKENS}/${custom}`;
    const init = INIT[this.#netwrok.selected];

    this.#identities = init;

    await BrowserStorage.set(
      buildObject(mainnetField, INIT[mainnet]),
      buildObject(testnetField, INIT[testnet]),
      buildObject(customField, INIT[custom])
    );
  }
}
