import type { TokenRes } from "types/token";
import type { SendResponseParams } from "types/stream";
import type { WalletState } from "types/wallet";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";

export async function getFTTokens(...addresses: string[]) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.GET_FT_STATES,
    payload: {
      addresses,
    },
  }).send();
  const resolve = warpMessage(data) as TokenRes[];
  return resolve;
}

export async function addFTToken(state: TokenRes) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.ADD_FT_TOKEN,
    payload: {
      state,
    },
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function rmFTToken(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.RM_FT_TOKEN,
    payload: {
      index,
    },
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}
