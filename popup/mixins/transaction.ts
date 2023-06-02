import type { MinTransactionParams } from "types/transaction";
import type { Token } from "types/token";

import { get } from 'svelte/store';
import { addToConfirmTransaction } from "app/backend/transactions";
import { viewIcon } from "app/utils/icon-view";
import { OperationsType } from "background/provider/operations";
import gasStore from 'popup/store/gas';
import { GAS_PRICE } from "config/gas";


export async function addConfirmTransaction(amount: number, recipient: string, token: Token) {
  const gas = get(gasStore);
  const params: MinTransactionParams = {
    type: OperationsType.Payment,
    toAddr: recipient,
    code: '',
    params: [],
    amount: amount * 10 ** token.decimals,
    gasPrice: GAS_PRICE,
    gasLimit: gas.gasLimit,
    icon: viewIcon(token.base58),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58
    }
  };

  await addToConfirmTransaction(params);
}

export async function addConfirmBuyRolls(rolls: number, recipient: string, token: Token) {
  const gas = get(gasStore);
  const params: MinTransactionParams = {
    type: OperationsType.RollBuy,
    toAddr: recipient,
    code: '',
    params: [],
    amount: rolls,
    gasPrice: GAS_PRICE,
    gasLimit: gas.gasLimit,
    icon: viewIcon(token.base58),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58
    }
  };

  await addToConfirmTransaction(params);
}

export async function addConfirmSellRolls(rolls: number, recipient: string, token: Token) {
  const gas = get(gasStore);
  const params: MinTransactionParams = {
    type: OperationsType.RollSell,
    toAddr: recipient,
    code: '',
    params: [],
    amount: rolls,
    gasPrice: GAS_PRICE,
    gasLimit: gas.gasLimit,
    icon: viewIcon(token.base58),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58
    }
  };

  await addToConfirmTransaction(params);
}
