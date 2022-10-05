import type {
  ReqBody,
  SendResponseParams,
  ContentWalletData
} from "types";

import { MTypeTab, MTypeTabContent } from "config/stream-keys";
import { TabStream } from "lib/stream/tab-stream";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { ContentMessage } from "lib/stream/secure-message";


export class ContentTabStream {
  readonly #stream: TabStream;
  readonly #domain = globalThis.document.domain;

  #phishing = true;

  get stream() {
    return this.#stream;
  }

  get domain() {
    return this.#domain;
  }

  constructor() {
    this.#stream = new TabStream(MTypeTabContent.CONTENT);
    this.#stream.listen((msg) => this.#fromInpage(msg));
    this.#start();
  }

  #fromInpage(msg: ReqBody) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case MTypeTab.GET_DATA:
        this.#start();
        break;
      case MTypeTab.CONTENT_PROXY_MEHTOD:
        this.#proxy(msg.payload);
        break;
      case MTypeTab.CONNECT_APP:
        new Message(msg).send();
        break;
      case MTypeTab.DISCONNECT_APP:
        new Message(msg).send();
        break;
      default:
        break;
    }
  }

  async #proxy(msg: object) {
    console.log(msg);
  }

  async #start() {
    const data = await new Message<SendResponseParams>({
      type: MTypeTab.GET_DATA,
      payload: {
        domain: this.domain
      }
    }).send();
    const resolve = warpMessage(data) as ContentWalletData;

    this.#phishing = resolve.phishing;

    if (resolve.connected) {
      new ContentMessage({
        type: MTypeTab.GET_DATA,
        payload: resolve,
      }).send(this.#stream, MTypeTabContent.INJECTED);
    }
  }
}
