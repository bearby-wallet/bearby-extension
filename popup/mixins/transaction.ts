import type { MinTransactionParams } from "types/transaction";
import type { Token } from "types/token";

import { addToConfirmTransaction } from "app/backend/transactions";
import { viewIcon } from "app/utils/icon-view";
import { OperationsType } from "background/provider/operations";


export async function addConfirmTransaction(amount: number, recipient: string, sender: number, token: Token) {
  const params: MinTransactionParams = {
    type: OperationsType.Payment,
    toAddr: recipient,
    code: '',
    params: '',
    amount: amount * 10**token.decimals,
    gasPrice: 0,
    gasLimit: 0,
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
