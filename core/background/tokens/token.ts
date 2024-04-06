import type { Balance, SCReadData, Token, TokenRes } from 'types';
import type { MassaControl } from 'background/provider';
import type { NetworkControl } from 'background/network';
import type { AccountController } from 'background/account';

import { ROLL_ADDRESS, ZERO_ADDRESS } from 'config/common';
import { NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';
import { FAIL_FETCH_TOKEN_STATE, TokenError } from './errors';
import { Args } from 'lib/args';
import { bytesToU256 } from 'lib/args/numbers';
import { MIN_GAS_READ } from 'config/gas';
import { bytesToStr } from 'lib/args/strings';


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

    await this.#tokenfetch();
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

  async #tokenfetch(addresses: string[]): Promise<TokenRes[]> {
    const limit = addresses.length;
    const decimalsBody = addresses.map((address) => ({
      max_gas: MIN_GAS_READ,
      target_address: address,
      target_function: "decimals",
      parameter: [],
    } as SCReadData));
    const symbolBody = addresses.map((address) => ({
      max_gas: MIN_GAS_READ,
      target_address: address,
      target_function: "symbol",
      parameter: [],
    } as SCReadData));
    const nameBody = addresses.map((address) => ({
      max_gas: MIN_GAS_READ,
      target_address: address,
      target_function: "name",
      parameter: [],
    } as SCReadData));
    const balanceBody = addresses.map((address) => ({
      max_gas: MIN_GAS_READ,
      target_address: address,
      target_function: "balanceOf",
      parameter: Array.from(new Args().addString(this.#account.selectedAccount?.base58 || '').serialize()),
    } as SCReadData));
    const body = [...decimalsBody, ...symbolBody, ...nameBody, ...balanceBody];
    const [resonses] = await this.#massa.executeReadOnlyCall(...body);

    if (resonses.result) {
      const results = resonses.result.map((r) => Uint8Array.from(r.result.Ok));
      let decimalsRes = results.slice(0, limit).map((r) => r[0]);
      let symbolRes = results.slice(limit, limit * 2).map(bytesToStr);
      let nameRes = results.slice(limit * 2, limit * 3).map(bytesToStr);
      let balanceRes = results.slice(limit * 3, limit * 4).map((bytes) => bytesToU256(bytes));

      const result = decimalsRes.map((decimal, index) => ({
        decimals: Number(decimal),
        symbol: String(symbolRes[index]),
        name: String(nameRes[index]),
        balance: {
          [this.#account.wallet.selectedAddress]: String(balanceRes[index])
        }
      }));

      return result;
    } else {
      throw new TokenError(FAIL_FETCH_TOKEN_STATE);
    }
  }

  async #buidlBodiesTokens(addresses: string[]) {
    let user = Array.from(new Args().addString('AU1aFiPAan1ucLZjS6iREznGYHHpTseRFAXEYvYsbCocU9RL64GW').serialize());
    const data = addresses.map((address) => ({
      max_gas: MIN_GAS_READ,
      target_address: address,
      target_function: "balanceOf",
      parameter: user,
    } as SCReadData));
    const [resonses] = await this.#massa.executeReadOnlyCall(...data);
    if (resonses.result) {
      const result = Uint8Array.from(resonses.result[1].result.Ok);
      console.log(bytesToU256(result));
    }
  }

  // async #buidlBodiesTokens() {
  //   // TODO: make const for MAX and fee
  //   let user = Array.from(new Args().addString('AU1aFiPAan1ucLZjS6iREznGYHHpTseRFAXEYvYsbCocU9RL64GW').serialize());
  //   const addresses: string[] = ['AS1sKBEGsqtm8vQhQzi7KJ4YhyaKTSkhJrLkRc7mQtPqme3VcFHm', 'AS186NRhT6itQ8LuCS7a8n6xQYiXrqDcaaoeiYpTSUsJWKEMgTEw'];
  //   const data = addresses.map((address) => ({
  //     max_gas: 2100000,
  //     target_address: address,
  //     target_function: "balanceOf",
  //     parameter: user,
  //   } as SCReadData));
  //   const [resonses] = await this.#massa.executeReadOnlyCall(...data);
  //   if (resonses.result) {
  //     const result = Uint8Array.from(resonses.result[1].result.Ok);
  //     console.log(bytesToU256(result));
  //   }
  // }
}
