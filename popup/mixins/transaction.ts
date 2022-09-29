import { addToConfirmTransaction } from "app/backend/transactions";
import { MASSA_DECIMAL } from "config/common";
import type { TransactionParam } from "types/transaction";


export async function addConfirmTransaction(amount: number, recipient: string, sender: number, token: string) {
  console.log(amount, recipient, sender, token);
  const params: TransactionParam = {
    recipient,
    fee: 0,
    contractDataBase64: '',
    parameters: '',
    amount: amount * 10**MASSA_DECIMAL,
    gasPrice: 0,
  };

  await addToConfirmTransaction(params);
}
