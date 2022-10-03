import type { SendResponseParams, MinTransactionParams, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";


export async function addToConfirmTransaction(transaction: MinTransactionParams) {
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

export async function bordercastTransaction(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SIGN_AND_SEND_TX,
    payload: {
      index
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}
