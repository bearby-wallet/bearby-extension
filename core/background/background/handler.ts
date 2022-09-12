import type { BackgroundState } from "./state";

import { MTypePopup } from "config/stream-keys";
import { Runtime } from "lib/runtime";
import { BackgroundWallet } from "./wallet";


export function startBackground(core: BackgroundState) {
  const wallet = new BackgroundWallet(core);

  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    switch (msg.type) {
      case MTypePopup.GET_LATEST_BLOCK:
        return true;
      case MTypePopup.GET_WALLET_STATE:
        wallet.getState(sendResponse);
        return true;
      case MTypePopup.GET_RANDOM_WORDS:
        wallet.randomWords(msg.payload.length, sendResponse);
        return true;
      default:
        sendResponse(null);
        return true;
    }
  });
}
