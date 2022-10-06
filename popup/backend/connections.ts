import type { AppConnection, SendResponseParams, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import connectionsStore from 'popup/store/connections';
import { updateState } from "./store-update";


export async function getConnections() {
  const data = await Message
    .signal(MTypePopup.GET_CONNECTIONS)
    .send();
  const resolve = warpMessage(data) as AppConnection[];
  connectionsStore.set(resolve);
  return resolve;
}

export async function removeConnection(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.REMOVE_CONNECTION,
    payload: {
      index
    }
  }).send();
  const resolve = warpMessage(data) as AppConnection[];
  connectionsStore.set(resolve);
  return resolve;
}

export async function approveConnection(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.APPROVE_CONNECTION,
    payload: {
      index
    }
  }).send();
  const resolve = warpMessage(data) as WalletState;
  updateState(resolve);
  return resolve;
}

export async function rejectConnection(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.REJECT_CONNECTION,
    payload: {
      index
    }
  }).send();
  const resolve = warpMessage(data) as WalletState;
  updateState(resolve);
  return resolve;
}
