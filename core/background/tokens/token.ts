import type { Balance, SCReadData, Token, TokenRes, ExecuteReadOnlyCallResponse } from 'types';
import type { NetworkControl } from 'background/network';
import type { AccountController } from 'background/account';

import { ROLL_ADDRESS, ZERO_ADDRESS } from 'config/common';
import { JsonRPCRequestMethods, MassaControl } from 'background/provider';
import { NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';
import { FAIL_FETCH_TOKEN_STATE, INVALID_DECIMALS, INVALID_NAME, INVALID_SYMBOL, TokenError, TOKEN_UNIQUE } from './errors';
import { Args } from 'lib/args';
import { bytesToU256 } from 'lib/args/numbers';
import { MIN_GAS_READ } from 'config/gas';
import { bytesToStr } from 'lib/args/strings';
import { assert } from 'lib/assert';
import { TypeOf } from 'lib/type';


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

  async addFT(state: TokenRes) {
    assert(state.decimals > 0 || state.decimals < 255, INVALID_DECIMALS, TokenError);
    assert(state.name.length > 0, INVALID_NAME, TokenError);
    assert(state.symbol.length > 0, INVALID_SYMBOL, TokenError);
    assert(!this.identities.some(
      ({ base58, symbol, name }) => base58 === state.base58
        || symbol === state.symbol
        || name === state.name
    ), TOKEN_UNIQUE, TokenError);

    this.#identities.push({
      decimals: state.decimals,
      rate: 0,
      name: state.name,
      symbol: state.symbol,
      base58: state.base58,
    });

    await BrowserStorage.set(
      buildObject(this.field, this.identities),
    );
  }

  async removeFT(index: number) {
    this.#identities.splice(index, 1);

    await BrowserStorage.set(
      buildObject(this.field, this.identities),
    );
  }

  async tokenfetch(addresses: string[]): Promise<TokenRes[]> {
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
        base58: addresses[index],
        balance: {
          [this.#account.wallet.selectedAddress]: String(balanceRes[index])
        }
      }));

      return result;
    } else {
      throw new TokenError(FAIL_FETCH_TOKEN_STATE);
    }
  }

  async getBalances(): Promise<Balance[]> {
    const skipAmount = INIT[this.#network.selected].length;
    const tokensAddresses = this.identities.slice(skipAmount);
    const addresses = this.#account.wallet.identities.map((acc) => acc.base58);
    const nativeTokensBody = this.#massa.provider.buildBody(JsonRPCRequestMethods.GET_ADDRESSES, [addresses]);
    const ftTokensData: SCReadData[] = addresses.map((addr) => tokensAddresses.map((tokenAddr) => ({
      max_gas: MIN_GAS_READ,
      target_address: tokenAddr.base58,
      target_function: "balanceOf",
      parameter: Array.from(new Args().addString(addr).serialize()),
    }))).flat();
    const ftTokensBody = this.#massa.provider.buildBody(JsonRPCRequestMethods.EXECUTE_READ_ONLY_CALL, [ftTokensData]);
    const [nativeResonses, ftResonses] = await this.#massa.sendJson(nativeTokensBody, ftTokensBody);
    const ftResult: ExecuteReadOnlyCallResponse = ftResonses;
    const ftBalances = ftResult.result ?
      ftResult.result.map((result) => bytesToU256(Uint8Array.from(result.result.Ok)))
      :
      new Array(ftTokensData.length).fill(0n);

    const balances: Balance[] = [];

    if (nativeResonses.result) {
      for (let index = 0; index < nativeResonses.result.length; index++) {
        const resonse = nativeResonses.result[index];
        let balanceObject: Balance = {
          [MAS.base58]: {
            final: resonse.final_balance,
            candidate: resonse.candidate_balance
          },
          [ROLL.base58]: {
            final: String(resonse.final_roll_count),
            candidate: String(resonse.candidate_roll_count)
          }
        };

        for (let tokenIndex = 0; tokenIndex < tokensAddresses.length; tokenIndex++) {
          const data = ftTokensData[tokenIndex + index];
          const tokenbalance = ftBalances[tokenIndex + index];

          balanceObject[data.target_address] = {
            final: String(tokenbalance),
            candidate: "0"
          }
        }

        balances.push(balanceObject);
      }
    } else if (nativeResonses.error) {
      if (nativeResonses.error.message) {
        throw new TokenError(`code: ${nativeResonses.error.code}, ${nativeResonses.error.message}`);
      }

      throw new TokenError(JSON.stringify(nativeResonses.error));
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

      this.#identities = list;
    } catch (err) {
      await this.reset();
    }
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
