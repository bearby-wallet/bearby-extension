import type { SendResponseParams, TransactionParam, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";


export async function addToConfirmTransaction(transaction: TransactionParam) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.ADD_TX_FOR_CONFIRM,
    payload: {
      transaction
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function rejectConfirmTransaction(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.REJECT_TX_FOR_CONFIRM,
    payload: {
      index
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}
