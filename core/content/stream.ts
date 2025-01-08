import { MTypeTab, MTypeTabContent } from "config/stream-keys";
import { Runtime } from "lib/runtime";
import { ContentMessage } from "lib/stream/secure-message";
import { PAYLOAD_NILL } from "./errors";
import { ContentTabStream } from "./tab-stream";

export function startStream() {
  const tabStream = new ContentTabStream();
  const messages = Object.values(MTypeTab);

  Runtime.runtime.onMessage.addListener(
    (req: any, sender: any, sendResponse: any) => {
      // listing from background.js
      if (sender.id !== Runtime.runtime.id) {
        return;
      }

      const msg = new ContentMessage(req);

      if (!msg.type || !msg.payload) {
        sendResponse({
          reject: PAYLOAD_NILL,
        });
        return;
      }

      sendResponse({});

      if (messages.includes(msg.type)) {
        if (msg.type === MTypeTab.ACCOUNT_CHANGED && !tabStream.connected) {
          return;
        } else if (
          msg.type === MTypeTab.NETWORK_CHANGED &&
          !tabStream.connected
        ) {
          return;
        }

        new ContentMessage({
          type: msg.type,
          payload: msg.payload,
        }).send(tabStream.stream, MTypeTabContent.INJECTED);
      }
    },
  );
}
