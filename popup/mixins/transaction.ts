import type { MinTransactionParams } from "types/transaction";
import type { Token } from "types/token";

import Big from "big.js";
import { addToConfirmTransaction } from "app/backend/transactions";
import { TokenType, viewIcon } from "app/utils/icon-view";
import { OperationsType } from "background/provider/operations";
import { getManifestVersion } from "lib/runtime/manifest";
import { ManifestVersions } from "config/manifest-versions";
import { Runtime } from "lib/runtime";
import { ArgTypes } from "config/arg-types";

Big.PE = 99;

export async function addConfirmTransaction(
  amount: number | Big | string,
  recipient: string,
  token: Token,
) {
  let domain = "";

  if (getManifestVersion() == ManifestVersions.V3) {
    const { id } = await Runtime.windows.getCurrent();

    domain = String(id);
  } else {
    domain = Runtime.runtime.id;
  }

  const params: MinTransactionParams = {
    domain,
    type: OperationsType.Payment,
    toAddr: recipient,
    bytecode: "",
    bytecodeToDeploy: "",
    params: [],
    coins: amount.toString(),
    amount: amount.toString(),
    icon: viewIcon(token.base58, TokenType.FT),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58,
    },
  };

  await addToConfirmTransaction(params);
}

export async function addConfirmBuyRolls(
  rolls: number | string | Big,
  recipient: string,
  token: Token,
) {
  let domain = "";

  if (getManifestVersion() == ManifestVersions.V3) {
    const { id } = await Runtime.windows.getCurrent();

    domain = String(id);
  } else {
    domain = Runtime.runtime.id;
  }

  const params: MinTransactionParams = {
    domain,
    type: OperationsType.RollBuy,
    toAddr: recipient,
    bytecode: "",
    bytecodeToDeploy: "",
    params: [],
    coins: String(rolls),
    amount: String(rolls),
    icon: viewIcon(token.base58, TokenType.FT),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58,
    },
  };

  await addToConfirmTransaction(params);
}

export async function addConfirmSellRolls(
  rolls: number | string | Big,
  recipient: string,
  token: Token,
) {
  let domain = "";

  if (getManifestVersion() == ManifestVersions.V3) {
    const { id } = await Runtime.windows.getCurrent();

    domain = String(id);
  } else {
    domain = Runtime.runtime.id;
  }

  const params: MinTransactionParams = {
    domain,
    type: OperationsType.RollSell,
    toAddr: recipient,
    bytecode: "",
    bytecodeToDeploy: "",
    params: [],
    coins: String(rolls),
    amount: String(rolls),
    icon: viewIcon(token.base58, TokenType.FT),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58,
    },
  };

  await addToConfirmTransaction(params);
}

export async function addConfirmTransferFT(
  amount: number | string | Big,
  recipient: string,
  token: Token,
) {
  let domain = "";

  if (getManifestVersion() == ManifestVersions.V3) {
    const { id } = await Runtime.windows.getCurrent();

    domain = String(id);
  } else {
    domain = Runtime.runtime.id;
  }

  const params: MinTransactionParams = {
    domain,
    type: OperationsType.CallSC,
    toAddr: token.base58,
    bytecode: "",
    bytecodeToDeploy: "",
    func: "transfer",
    params: [
      {
        type: ArgTypes.STRING,
        value: recipient,
      },
      {
        type: ArgTypes.U256,
        value: String(amount),
      },
    ],
    coins: "0",
    amount: "0",
    icon: viewIcon(token.base58, TokenType.FT),
    title: token.name,
    token: {
      decimals: token.decimals,
      symbol: token.symbol,
      base58: token.base58,
    },
  };

  await addToConfirmTransaction(params);
}
