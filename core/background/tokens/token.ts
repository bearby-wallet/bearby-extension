import type { Balance, Token } from 'types';
import type { MassaControl } from 'background/provider';
import type { NetworkControl } from 'background/network';
import type { AccountController } from 'background/account';

import { ROLL_ADDRESS, ZERO_ADDRESS } from 'config/common';
import { NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';
import { TokenError } from './errors';


const [mainnet, buildnet, custom] = NETWORK_KEYS;

export const MAS = {
  decimals: 9,
  rate: 1,
  name: 'Massa',
  symbol: 'MAS',
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
  [mainnet]: [MAS, ROLL],
  [buildnet]: [MAS, ROLL],
  [custom]: [MAS, ROLL]
};

export class TokenControl {
  readonly #network: NetworkControl;
  readonly #massa: MassaControl;
  readonly #account: AccountController;

  #identities: Token[] = [];

  get identities() {
    return this.#identities;
  }

  get field() {
    return `${Fields.TOKENS}/${this.#network.selected}`;
  }

  constructor(
    network: NetworkControl,
    massa: MassaControl,
    account: AccountController
  ) {
    this.#account = account;
    this.#network = network;
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
          [MAS.base58]: {
            final: resonse.final_balance,
            candidate: resonse.candidate_balance
          },
          [ROLL.base58]: {
            final: String(resonse.final_roll_count),
            candidate: String(resonse.candidate_roll_count)
          }
        });
      }
    } else if (resonses.error) {
      if (resonses.error.message) {
        throw new TokenError(`code: ${resonses.error.code}, ${resonses.error.message}`);
      }

      throw new TokenError(JSON.stringify(resonses.error));
    }

    return balances;
  }

  // TODO: enable when add TOKENS.
  async sync() {
    // const jsonList = await BrowserStorage.get(this.field);
    //
    // try {
    //   const list = JSON.parse(String(jsonList));
    //
    //   if (!list || !TypeOf.isArray(list)) {
    //     return this.reset();
    //   }
    //
    //   if (list.length < this.#identities.length) {
    //     return this.reset();
    //   }
    //
    //   this.#identities = list;
    // } catch {
    //   await this.reset();
    // }
    await this.reset();
  }

  async reset() {
    const mainnetField = `${Fields.TOKENS}/${mainnet}`;
    const buildnetField = `${Fields.TOKENS}/${buildnet}`;
    const customField = `${Fields.TOKENS}/${custom}`;
    const init = INIT[this.#network.selected];

    this.#identities = init;

    await BrowserStorage.set(
      buildObject(mainnetField, INIT[mainnet]),
      buildObject(buildnetField, INIT[buildnet]),
      buildObject(customField, INIT[custom])
    );
  }
}
