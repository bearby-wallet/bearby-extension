import type { MinTransactionParams } from "types/transaction";
import type { Token } from "types/token";

import { get } from 'svelte/store';
import { addToConfirmTransaction } from "app/backend/transactions";
import { TokenType, viewIcon } from "app/utils/icon-view";
import { OperationsType } from "background/provider/operations";
import gasStore from 'popup/store/gas';
import { GAS_PRICE } from "config/gas";
import { getManifestVersion } from "lib/runtime/manifest";
import { ManifestVersions } from "config/manifest-versions";
import { Runtime } from "lib/runtime";


export async function addConfirmTransaction(amount: number, recipient: string, token: Token) {
  let domain = '';

  if (getManifestVersion() == ManifestVersions.V3) {
    const { id } = await Runtime.windows.getCurrent();

    domain = String(id);
  } else {
    domain = Runtime.runtime.id;
  }

  const gas = get(gasStore);
  const params: MinTransactionParams = {
    domain,
    type: OperationsType.Payment,
    toAddr: recipient,
    code: '',
    params: [],
    coins: String(amount * 10 ** token.decimals),
    gasPrice: GAS_PRICE,
    gasLimit: gas.gasLimit,
    icon: viewIcon(token.base58, TokenType.FT),
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
  let domain = '';

  if (getManifestVersion() == ManifestVersions.V3) {
    const { id } = await Runtime.windows.getCurrent();

    domain = String(id);
  } else {
    domain = Runtime.runtime.id;
  }

  const gas = get(gasStore);
  const params: MinTransactionParams = {
    domain,
    type: OperationsType.RollBuy,
    toAddr: recipient,
    code: '',
    params: [],
    coins: String(rolls),
    gasPrice: GAS_PRICE,
    gasLimit: gas.gasLimit,
    icon: viewIcon(token.base58, TokenType.FT),
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
  let domain = '';

  if (getManifestVersion() == ManifestVersions.V3) {
    const { id } = await Runtime.windows.getCurrent();

    domain = String(id);
  } else {
    domain = Runtime.runtime.id;
  }
  const gas = get(gasStore);
  const params: MinTransactionParams = {
    domain,
    type: OperationsType.RollSell,
    toAddr: recipient,
    code: '',
    params: [],
    coins: String(rolls),
    gasPrice: GAS_PRICE,
    gasLimit: gas.gasLimit,
    icon: viewIcon(token.base58, TokenType.FT),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58
    }
  };

  await addToConfirmTransaction(params);
}
