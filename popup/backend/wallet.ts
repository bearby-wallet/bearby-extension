import type { SendResponseParams, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";


export async function getRandomWords(n: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.GET_RANDOM_WORDS,
    payload: {
      length: n
    }
  }).send();
  return warpMessage(data);
}

export async function createWallet(words: string, password: string, name: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.GET_WALLET_STATE,
    payload: {
      words,
      name,
      password
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve
}

export async function getWalletState() {
  const data = await Message
    .signal(MTypePopup.GET_WALLET_STATE)
    .send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve
}