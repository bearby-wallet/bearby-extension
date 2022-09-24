import type { SendResponseParams, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";


export async function setDowngradeNodeFlag(flag: boolean) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_DOWNGRADE_NODE,
    payload: {
      flag
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}
