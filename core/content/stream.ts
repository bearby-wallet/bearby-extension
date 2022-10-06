import { MTypeTabContent } from "config/stream-keys";
import { Runtime } from "lib/runtime";
import { ContentMessage } from "lib/stream/secure-message";
import { PAYLOAD_NILL } from "./errors";
import { ContentTabStream } from "./tab-stream";


export function startStream() {
  const tabStream = new ContentTabStream();

  Runtime.runtime.onMessage.addListener((req, sender, sendResponse) => {
    // listing from background.js
    if (sender.id !== Runtime.runtime.id) {
      return;
    }

    const msg = new ContentMessage(req);

    if (!msg.type || !msg.payload) {
      sendResponse({
        reject: PAYLOAD_NILL
      });
      return;
    }

    new ContentMessage({
      type: msg.type,
      payload: msg.payload
    }).send(tabStream.stream, MTypeTabContent.INJECTED);

    sendResponse({});
  });
}
