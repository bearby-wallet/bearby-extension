import type { BackgroundState } from "./state";

import { MTypePopup } from "config/stream-keys";
import { Runtime } from "lib/runtime";


export function startBackground(core: BackgroundState) {
  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    switch (msg.type) {
      case MTypePopup.GET_LATEST_BLOCK:
        return true;
      default:
        sendResponse(null);
        return true;
    }
  });
}
