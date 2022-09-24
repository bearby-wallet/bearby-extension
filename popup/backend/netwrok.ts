import type { NetwrokConfig, SendResponseParams, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";


export async function selectNetwrok(net: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SELECT_NETWORK,
    payload: {
      net
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function getNetworkConfig() {
  const data = await Message
    .signal(MTypePopup.GET_NETWORK_CONFIG)
    .send();
  return warpMessage(data) as {
    config: NetwrokConfig;
    count: number;
  };
}

export async function updateCount(count: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_COUNT,
    payload: {
      count
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function addNodeAPI(node: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.ADD_NODE,
    payload: {
      node
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function sortNodes(node: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SORT_NODES,
    payload: {
      node
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function removeNode(node: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.REMOVE_NODES,
    payload: {
      node
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}
